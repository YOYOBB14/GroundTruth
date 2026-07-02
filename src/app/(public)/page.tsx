import Link from "next/link"
import {
  ArrowRight,
  DollarSign,
  Camera,
  CheckCircle,
  Clock,
  Home,
  Shield,
  FileText,
  UserCheck,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const TASKS = [
  {
    title: "Wash Dishes",
    duration: "5–10 minutes",
    description:
      "Record yourself washing dishes from start to finish, including rinsing and drying.",
  },
  {
    title: "Fold Laundry",
    duration: "5–8 minutes",
    description:
      "Fold at least 8–10 clean clothing items on a flat surface such as a bed or table.",
  },
  {
    title: "Organize Shelves",
    duration: "5–10 minutes",
    description:
      "Organize items on a kitchen shelf or inside a cabinet, wipe the surface, and arrange neatly.",
  },
]

const TRUST_POINTS = [
  {
    icon: <DollarSign className="size-5 text-indigo-600" />,
    label: "Rewards for approved submissions",
    detail: "Approved submissions may qualify for rewards. Details are provided after review.",
  },
  {
    icon: <FileText className="size-5 text-indigo-600" />,
    label: "Clear task instructions",
    detail: "Every task includes step-by-step instructions provided before you start recording.",
  },
  {
    icon: <UserCheck className="size-5 text-indigo-600" />,
    label: "Reviewed by a real person",
    detail: "Every submission is watched and reviewed by a member of our team — no automated rejection.",
  },
  {
    icon: <Shield className="size-5 text-indigo-600" />,
    label: "No hidden fees",
    detail: "The reward shown is exactly what you receive. No deductions, no platform cuts.",
  },
  {
    icon: <Home className="size-5 text-indigo-600" />,
    label: "Record from home",
    detail: "Use your own smartphone or action camera. No studio, no travel, no special setup.",
  },
]

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">

      {/* ── Hero ── */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          Earn money by recording simple household tasks
        </h1>
        {/* Early access */}
        <p className="text-sm text-gray-500 mb-8">
          Early access program now open
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))}>
            Become a Contributor <ArrowRight className="ml-1 size-4" />
          </Link>
          <Link href="/tasks" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            Browse Tasks
          </Link>
        </div>
      </section>

      {/* ── Visual concept ── */}
      <section className="mb-16">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Left: You record */}
          <div className="flex-1 max-w-xs rounded-xl bg-gray-100 p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
              You record
            </p>
            {/* Video frame mockup */}
            <div className="relative rounded-lg bg-gray-300 aspect-video flex items-center justify-center mb-4">
              <svg
                viewBox="0 0 24 24"
                className="size-10 text-gray-500"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              <span className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-gray-600 font-medium">
                Household task · 1080p
              </span>
            </div>
            <div className="flex items-center justify-center gap-3 text-gray-500 text-xs">
              <span className="flex items-center gap-1">
                <Camera className="size-3.5" /> Smartphone
              </span>
              <span className="flex items-center gap-1">
                <Home className="size-3.5" /> At home
              </span>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0">
            <ArrowRight className="size-7 text-gray-400 rotate-90 sm:rotate-0" />
          </div>

          {/* Right: Robots learn */}
          <div className="flex-1 max-w-xs rounded-xl bg-indigo-50 p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-4">
              Robots learn
            </p>
            {/* Robotic arm SVG */}
            <div className="flex justify-center mb-4">
              <svg
                viewBox="0 0 80 80"
                className="w-24 h-24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Base */}
                <rect x="30" y="64" width="20" height="8" rx="2" fill="#c7d2fe" />
                {/* Lower arm */}
                <rect x="36" y="44" width="8" height="24" rx="4" fill="#818cf8" />
                {/* Elbow joint */}
                <circle cx="40" cy="44" r="6" fill="#6366f1" />
                {/* Upper arm */}
                <rect
                  x="36"
                  y="20"
                  width="8"
                  height="28"
                  rx="4"
                  fill="#818cf8"
                  transform="rotate(-20 40 44)"
                />
                {/* Shoulder joint */}
                <circle cx="40" cy="20" r="5" fill="#6366f1" />
                {/* Gripper */}
                <rect x="52" y="10" width="4" height="14" rx="2" fill="#6366f1" transform="rotate(20 54 17)" />
                <rect x="44" y="10" width="4" height="14" rx="2" fill="#6366f1" transform="rotate(-20 46 17)" />
              </svg>
            </div>
            <p className="text-sm font-medium text-indigo-700">AI training data</p>
            <p className="text-xs text-indigo-500 mt-1">Humanoid robotics</p>
          </div>
        </div>
      </section>

      {/* ── Available tasks ── */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-6 text-center">Available tasks today</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {TASKS.map((task) => (
            <div
              key={task.title}
              className="rounded-lg border border-gray-200 bg-white shadow-sm p-5 flex flex-col"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-base">{task.title}</h3>
                <span className="text-sm font-medium text-gray-600">Reward: Available</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                <Clock className="size-3.5" />
                {task.duration}
              </div>
              <p className="text-sm text-gray-600 flex-1 mb-4">{task.description}</p>
              <Link
                href="/tasks"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "w-full justify-center border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                )}
              >
                View Task
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-8 text-center">How it works</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: <CheckCircle className="size-5" />,
              step: "1. Sign up",
              description:
                "Create a contributor profile with your name, contact details, and demographics. Takes under 2 minutes.",
            },
            {
              icon: <Camera className="size-5" />,
              step: "2. Record a task",
              description:
                "Pick an active task, mount your camera, and record yourself doing it at home. Follow the task instructions.",
            },
            {
              icon: <DollarSign className="size-5" />,
              step: "3. Earn rewards",
              description:
                "Upload your video. Once reviewed and approved, you may qualify for a reward.",
            },
          ].map((item) => (
            <div key={item.step} className="rounded-xl border border-border p-6">
              <div className="mb-3 text-muted-foreground">{item.icon}</div>
              <div className="font-semibold mb-1">{item.step}</div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trust section ── */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-8 text-center">
          Why contributors trust GroundTruth
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TRUST_POINTS.map((point) => (
            <div key={point.label} className="flex flex-col gap-2 p-4">
              <div>{point.icon}</div>
              <p className="font-semibold text-sm">{point.label}</p>
              <p className="text-sm text-gray-500">{point.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Requirements ── */}
      <section>
        <h2 className="text-xl font-semibold mb-6 text-center">Requirements</h2>
        <ul className="mx-auto max-w-lg space-y-3 text-sm text-muted-foreground">
          {[
            "18 years or older",
            "Head or chest mount camera (GoPro, phone mount, or similar)",
            "Good lighting — natural or bright artificial",
            "Quiet, uncluttered space for the task",
            "Ability to upload video files (MP4, MOV) up to 2 GB",
          ].map((req) => (
            <li key={req} className="flex items-center gap-2">
              <CheckCircle className="size-4 text-foreground flex-shrink-0" />
              {req}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
