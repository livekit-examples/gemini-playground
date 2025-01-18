from __future__ import annotations

import asyncio
import json
import logging
from dataclasses import asdict, dataclass
from typing import Any, Dict, Literal, List

from livekit import rtc
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    WorkerType,
    cli,
    llm,
)
from livekit.agents.multimodal import MultimodalAgent
from livekit.plugins.google import beta as google

from dotenv import load_dotenv

load_dotenv(dotenv_path=".env.local")

logger = logging.getLogger("gemini-playground")
logger.setLevel(logging.INFO)

@dataclass
class SessionConfig:
    gemini_api_key: str
    instructions: str
    voice: google.realtime.Voice
    temperature: float
    max_response_output_tokens: str | int
    modalities: list[google.realtime.ResponseModality]
    presence_penalty: float
    frequency_penalty: float

    def __post_init__(self):
        if self.modalities is None:
            self.modalities = self._modalities_from_string("text_and_audio")

    def to_dict(self):
        return {k: v for k, v in asdict(self).items() if k != "gemini_api_key"}

    @staticmethod
    def _modalities_from_string(modalities: str) -> list[google.realtime.ResponseModality]:
        modalities_map: Dict[str, List[google.realtime.ResponseModality]] = {
            "text_and_audio": ["TEXT", "AUDIO"],
            "text_only": ["TEXT"],
        }
        return modalities_map.get(modalities, ["TEXT", "AUDIO"])

    def __eq__(self, other) -> bool:
        return self.to_dict() == other.to_dict()


def parse_session_config(data: Dict[str, Any]) -> SessionConfig:
    config = SessionConfig(
        gemini_api_key=data.get("gemini_api_key", ""),
        instructions=data.get("instructions", ""),
        voice=data.get("voice", ""),
        temperature=float(data.get("temperature", 0.8)),
        max_response_output_tokens=data.get("max_output_tokens")
        if data.get("max_output_tokens") == "inf"
        else int(data.get("max_output_tokens") or 2048),
        modalities=SessionConfig._modalities_from_string(
            data.get("modalities", "text_and_audio")
        ),
        presence_penalty=float(data.get("presence_penalty", 0.0)),
        frequency_penalty=float(data.get("frequency_penalty", 0.0)),
    )
    return config


async def entrypoint(ctx: JobContext):
    logger.info(f"connecting to room {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    participant = await ctx.wait_for_participant()

    await run_multimodal_agent(ctx, participant)
    logger.info("agent started")


async def run_multimodal_agent(ctx: JobContext, participant: rtc.Participant):
    metadata = json.loads(participant.metadata)
    config = parse_session_config(metadata)

    logger.info(f"starting MultimodalAgent with config: {config.to_dict()}")

    if not config.gemini_api_key:
        raise Exception("Gemini API Key is required")


    model = google.realtime.RealtimeModel(
        api_key=config.gemini_api_key,
        instructions=config.instructions,
        voice=config.voice,
        temperature=config.temperature,
        max_output_tokens=int(config.max_response_output_tokens),
    )
    assistant = MultimodalAgent(model=model)
    assistant.start(ctx.room)
    session = model.sessions[0]

    if config.modalities == ["TEXT", "AUDIO"]:
        chat_ctx = llm.ChatContext(messages=[llm.ChatMessage(
                role="user",
                content="Please begin the interaction with the user in a manner consistent with your instructions.",
            )
        ])
        await session.set_chat_ctx(chat_ctx)

    @ctx.room.local_participant.register_rpc_method("pg.updateConfig")
    async def update_config(
        data: rtc.rpc.RpcInvocationData,
    ):
        if data.caller_identity != participant.identity:
            return

        new_config = parse_session_config(json.loads(data.payload))
        if config != new_config:
            logger.info(
                f"config changed: {new_config.to_dict()}, participant: {participant.identity}"
            )
            session = model.sessions[0]
            session._queue_msg({ "type": "session.update", "session": new_config.to_dict() })
            return json.dumps({"changed": True})
        else:
            return json.dumps({"changed": False})


    async def show_toast(
        title: str,
        description: str | None,
        variant: Literal["default", "success", "warning", "destructive"],
    ):
        await ctx.room.local_participant.perform_rpc(
            destination_identity=participant.identity,
            method="pg.toast",
            payload=json.dumps(
                {"title": title, "description": description, "variant": variant}
            ),
        )


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, worker_type=WorkerType.ROOM))
