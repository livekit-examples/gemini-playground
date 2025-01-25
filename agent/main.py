from __future__ import annotations

import asyncio
import json
import logging
from dataclasses import asdict, dataclass
from typing import Any, Dict, List, cast

from dotenv import load_dotenv
from google.genai.types import Modality
from livekit import rtc
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    WorkerType,
    cli,
    llm,
    utils,
)
from livekit.agents.multimodal import MultimodalAgent
from livekit.plugins.google import beta as google

load_dotenv(dotenv_path=".env.local")

logger = logging.getLogger("gemini-playground")
logger.setLevel(logging.INFO)

initial_chat_ctx = llm.ChatContext(
    messages=[
        llm.ChatMessage(
            role="user",
            content="Please begin the interaction with the user in a manner consistent with your instructions.",
        )
    ]
)


@dataclass
class SessionConfig:
    gemini_api_key: str
    instructions: str
    voice: google.realtime.Voice
    temperature: float
    max_response_output_tokens: str | int
    modalities: list[str]
    presence_penalty: float
    frequency_penalty: float

    def __post_init__(self):
        if self.modalities is None:
            self.modalities = self._modalities_from_string("audio_only")

    def to_dict(self):
        return {k: v for k, v in asdict(self).items() if k != "gemini_api_key"}

    @staticmethod
    def _modalities_from_string(
        modalities: str,
    ) -> list[str]:
        modalities_map: Dict[str, List[str]] = {
            "text_and_audio": ["TEXT", "AUDIO"],
            "text_only": ["TEXT"],
            "audio_only": ["AUDIO"],
        }
        return modalities_map.get(modalities, modalities_map["audio_only"])

    def __eq__(self, other) -> bool:
        return self.to_dict() == other.to_dict()


def parse_session_config(data: Dict[str, Any]) -> SessionConfig:
    config = SessionConfig(
        gemini_api_key=data.get("gemini_api_key", ""),
        instructions=data.get("instructions", ""),
        voice=data.get("voice", ""),
        temperature=float(data.get("temperature", 0.8)),
        max_response_output_tokens=
            "inf" if data.get("max_output_tokens") == "inf"
            else int(data.get("max_output_tokens") or 2048),
        modalities=SessionConfig._modalities_from_string(
            data.get("modalities", "audio_only")
        ),
        presence_penalty=float(data.get("presence_penalty", 0.0)),
        frequency_penalty=float(data.get("frequency_penalty", 0.0)),
    )
    return config


async def entrypoint(ctx: JobContext):
    logger.info(f"connecting to room {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    participant = await ctx.wait_for_participant()
    metadata = json.loads(participant.metadata)
    config = parse_session_config(metadata)
    session_manager = run_multimodal_agent(ctx, participant, config)

    logger.info("agent started")


class SessionManager:
    def __init__(self, config: SessionConfig):
        self.instructions = config.instructions
        self.chat_history: List[llm.ChatMessage] = []
        self.current_agent: MultimodalAgent | None = None
        self.current_model: google.realtime.RealtimeModel | None = None
        self.current_config: SessionConfig = config

    def create_model(self, config: SessionConfig) -> google.realtime.RealtimeModel:
        model = google.realtime.RealtimeModel(
            instructions=config.instructions,
            modalities=cast(list[Modality], config.modalities),
            voice=config.voice,
            temperature=config.temperature,
            max_output_tokens=int(config.max_response_output_tokens),
            api_key=config.gemini_api_key,
            enable_user_audio_transcription=False,
            enable_agent_audio_transcription=False,
        )
        return model

    def create_agent(self, model: google.realtime.RealtimeModel, chat_ctx: llm.ChatContext) -> MultimodalAgent:
        agent = MultimodalAgent(model=model, chat_ctx=chat_ctx)
        return agent

    def setup_session(self, ctx: JobContext, participant: rtc.RemoteParticipant, chat_ctx: llm.ChatContext):
        room = ctx.room
        self.current_model = self.create_model(self.current_config)
        self.current_agent = self.create_agent(self.current_model, chat_ctx)
        self.current_agent.start(room, participant)
        self.current_agent.generate_reply("cancel_existing")

        @ctx.room.local_participant.register_rpc_method("pg.updateConfig")
        async def update_config(data: rtc.rpc.RpcInvocationData):
            if self.current_agent is None or self.current_model is None or data.caller_identity != participant.identity:
                return json.dumps({"changed": False})

            new_config = parse_session_config(json.loads(data.payload))
            if self.current_config != new_config:
                logger.info(
                    f"config changed: {new_config.to_dict()}, participant: {participant.identity}"
                )

                self.current_config = new_config
                session = self.current_model.sessions[0]
                model = self.create_model(new_config)
                agent = self.create_agent(model, session.chat_ctx_copy())
                await self.replace_session(ctx, participant, agent, model)
                return json.dumps({"changed": True})
            else:
                return json.dumps({"changed": False})


    @utils.log_exceptions(logger=logger)
    async def end_session(self):
        if self.current_agent is None or self.current_model is None:
            return

        await utils.aio.gracefully_cancel(self.current_model.sessions[0]._main_atask)
        self.current_agent = None
        self.current_model = None

    @utils.log_exceptions(logger=logger)
    async def replace_session(self, ctx: JobContext, participant: rtc.RemoteParticipant, agent: MultimodalAgent, model: google.realtime.RealtimeModel):
        await self.end_session()

        self.current_agent = agent
        self.current_model = model
        agent.start(ctx.room, participant)
        agent.generate_reply("cancel_existing")

        session = self.current_model.sessions[0]

        chat_history = session.chat_ctx_copy()
        # Patch: remove the empty conversation items
        # https://github.com/livekit/agents/pull/1245
        chat_history.messages = [
            msg
            for msg in chat_history.messages
            if msg.tool_call_id or msg.content is not None
        ]
        # session._remote_conversation_items = _RemoteConversationItems()

        # create a new connection
        session._main_atask = asyncio.create_task(session._main_task())
        # session.session_update()

        chat_history.append(
            text="We've just been reconnected, please continue the conversation.",
            role="assistant",
        )
        await session.set_chat_ctx(chat_history)


def run_multimodal_agent(
    ctx: JobContext, participant: rtc.RemoteParticipant, config: SessionConfig
) -> SessionManager:
    logger.info("starting multimodal agent")

    session_manager = SessionManager(config)
    session_manager.setup_session(ctx, participant, initial_chat_ctx)

    return session_manager


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, worker_type=WorkerType.ROOM))
