'use client';

export function WaitlistSection() {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">Join Our Waitlist</h2>
        <p className="text-xl text-muted-foreground mb-8">
          Be among the first to experience the future of interactive cooking.
          Sign up now and get early access when we launch.
        </p>
        <a
          href="https://forms.gle/xhC3GgxG2vy3GkJE8"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-4 bg-primary text-white rounded-full text-lg hover:bg-primary-light transition-colors"
        >
          Join Waitlist
        </a>
      </div>
    </section>
  );
}
