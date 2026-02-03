import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"

const featureCards = [
  {
    title: "Design With Confidence",
    description:
      "Build clean, modern depth for buttons, cards, and panels using layered shadows that feel natural in light and dark UI.",
  },
  {
    title: "Instant CSS Export",
    description:
      "Copy production-ready `box-shadow` values with a single click and ship faster without guesswork.",
  },
  {
    title: "Preset + Custom Control",
    description:
      "Start from polished presets or dial in your own blur, spread, offsets, and color for a perfect match.",
  },
]

const guideSteps = [
  "Pick a preset to see a proven shadow style quickly.",
  "Adjust blur and opacity to control softness and realism.",
  "Add a second layer to create deeper, more premium depth.",
  "Check the preview on light and dark backgrounds.",
  "Copy the CSS and apply it to your UI component.",
]

const tips = [
  "Keep subtle shadows for large surfaces like cards and panels.",
  "Use tighter, darker shadows for small buttons and chips.",
  "Stack 2–3 layers instead of using one heavy shadow.",
  "Match shadow color with your brand palette for consistency.",
]

const mistakes = [
  "Overusing large blur values that make elements feel floaty.",
  "Using pure black shadows without reducing opacity.",
  "Ignoring how shadows look on dark mode backgrounds.",
]

const useCases = [
  "UI card and pricing panels",
  "Primary and secondary buttons",
  "Modal, drawer, and dropdown depth",
  "Skeuomorphic mockups and landing hero emphasis",
]

const faqs = [
  {
    q: "What is a CSS box shadow?",
    a: "A CSS box shadow is the `box-shadow` property that adds depth by creating a blurred, offset shadow behind an element.",
  },
  {
    q: "How many shadow layers should I use?",
    a: "Most modern UI uses 1–3 layers. More layers add richness but can look heavy if overdone.",
  },
  {
    q: "Do shadows hurt performance?",
    a: "A few simple shadows are fine for modern browsers. Avoid extreme blur on many elements in large lists.",
  },
  {
    q: "Can I use these shadows in Figma or other design tools?",
    a: "Yes. The values here map closely to common design tools so you can recreate the same depth in your mockups.",
  },
  {
    q: "Is this tool free to use?",
    a: "Yes, Shadow Generator is a free CSS box shadow generator built for designers and developers.",
  },
]

export default function SeoSections() {
  return (
    <section
      id="learn"
      aria-labelledby="shadow-generator-guide"
      className="border-t bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950"
    >
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Free CSS Box Shadow Generator
          </p>
          <h2
            id="shadow-generator-guide"
            className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white"
          >
            Build Beautiful CSS Box Shadows With Precision
          </h2>
          <p className="text-muted-foreground max-w-3xl">
            Shadow Generator helps you create realistic depth and elevation for UI components.
            It is a fast, beginner-friendly tool for designers and developers who want
            perfect CSS `box-shadow` values without guesswork.
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <a className="px-3 py-1 rounded-full border text-muted-foreground hover:text-gray-900 dark:hover:text-white" href="#about">
              About
            </a>
            <a className="px-3 py-1 rounded-full border text-muted-foreground hover:text-gray-900 dark:hover:text-white" href="#beginner-guide">
              Beginner Guide
            </a>
            <a className="px-3 py-1 rounded-full border text-muted-foreground hover:text-gray-900 dark:hover:text-white" href="#how-to-use">
              How To Use
            </a>
            <a className="px-3 py-1 rounded-full border text-muted-foreground hover:text-gray-900 dark:hover:text-white" href="#tips">
              Tips
            </a>
            <a className="px-3 py-1 rounded-full border text-muted-foreground hover:text-gray-900 dark:hover:text-white" href="#faq">
              FAQ
            </a>
          </div>
        </div>

        <div id="about" className="mt-12 grid gap-6 md:grid-cols-3">
          {featureCards.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div id="beginner-guide" className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Beginner Guide: Make Your First Shadow</CardTitle>
              <CardDescription>
                A simple step-by-step path to clean, professional depth.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="grid gap-3 text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside">
                {guideSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div id="how-to-use" className="mt-12 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>How To Use Shadow Generator</CardTitle>
              <CardDescription>Quick workflow for daily design work.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
                <li>Choose a starting preset or create a new layer.</li>
                <li>Tune offset, blur, spread, and color in real time.</li>
                <li>Preview on the canvas to confirm depth.</li>
                <li>Copy the CSS and paste it into your component.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Why This Helps Your UI</CardTitle>
              <CardDescription>Consistency and speed without compromises.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
                <li>Creates realistic elevation and hierarchy.</li>
                <li>Reduces trial-and-error during design handoff.</li>
                <li>Improves UI clarity by separating layers.</li>
                <li>Speeds up CSS production for teams.</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div id="tips" className="mt-12 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Best Practices</CardTitle>
              <CardDescription>Small changes that make a big difference.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
                {tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common Mistakes</CardTitle>
              <CardDescription>Fix these to keep shadows modern.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
                {mistakes.map((mistake) => (
                  <li key={mistake}>{mistake}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Use Cases</CardTitle>
              <CardDescription>Where box shadows add the most value.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
                {useCases.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Glossary</CardTitle>
              <CardDescription>Quick definitions for beginners.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-gray-700 dark:text-gray-300">
              <p><span className="font-semibold">Offset:</span> Moves the shadow left/right and up/down.</p>
              <p><span className="font-semibold">Blur:</span> Softens the edge of the shadow.</p>
              <p><span className="font-semibold">Spread:</span> Expands or tightens the shadow size.</p>
              <p><span className="font-semibold">Opacity:</span> Controls how strong the shadow appears.</p>
            </CardContent>
          </Card>
        </div>

        <div id="faq" className="mt-12 grid gap-6 md:grid-cols-2">
          {faqs.map((item) => (
            <Card key={item.q}>
              <CardHeader>
                <CardTitle>{item.q}</CardTitle>
                <CardDescription>{item.a}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
