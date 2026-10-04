"use client";

import { type CSSProperties, useRef, useState } from "react"
import { mascotConfig } from "@/mascot.config"
import { type MascotSignal, type MascotSnapshot } from "./engine/player"
import "./mascot.css"
import { useMascotSenses } from "./engine/senses"

const initialSnapshot: MascotSnapshot = {
  mode: "rest",
  behavior: null,
  xPercent: mascotConfig.motion.startHorizontalPercent,
  transitionMs: 700,
  actionMs: 0,
  drives: { ...mascotConfig.drives.defaults },
}

export default function OsintMascot() {
  const [snapshot, setSnapshot] = useState(initialSnapshot)
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const signalsRef = useRef<MascotSignal[]>([])
  const dockRef = useRef<HTMLElement>(null)
  const [renderPaused, setRenderPaused] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useMascotSenses(buttonRef, signalsRef, setSnapshot, setTheme, dockRef, setRenderPaused)

  const anchorX = () => {
    const box = buttonRef.current?.getBoundingClientRect()
    return box ? (box.left + box.width / 2) / window.innerWidth * 100 : snapshot.xPercent
  }
  const enqueue = (signal: MascotSignal) => signalsRef.current.push(signal)
  const plate = theme === "dark" ? mascotConfig.core.dark : mascotConfig.core.light
  const sprout = theme === "dark" ? mascotConfig.core.sprout.dark : mascotConfig.core.sprout.light
  const style = {
    left: "50%",
    bottom: 0,
    "--osint-breath-ms": mascotConfig.animation.breathMs + "ms",
    "--osint-blink-ms": mascotConfig.animation.blinkMs + "ms",
    "--osint-sprout-angle": mascotConfig.animation.sproutDegrees + "deg",
    "--osint-hover-ms": mascotConfig.scheduler.hoverMs + "ms",
    "--osint-click-ms": mascotConfig.scheduler.clickMs + "ms",
    "--osint-mobile-width": mascotConfig.motion.stage.mobile.width + "px",
    "--osint-mobile-height": mascotConfig.motion.stage.mobile.height + "px",
    "--osint-desktop-width": mascotConfig.motion.stage.desktop.width + "px",
    "--osint-desktop-height": mascotConfig.motion.stage.desktop.height + "px",
    "--osint-mobile-rest": mascotConfig.motion.restOffsetPx.mobile + "px",
    "--osint-desktop-rest": mascotConfig.motion.restOffsetPx.desktop + "px",
    "--osint-mobile-peek": mascotConfig.motion.peekOffsetPx.mobile + "px",
    "--osint-desktop-peek": mascotConfig.motion.peekOffsetPx.desktop + "px",
    "--osint-mobile-hidden": mascotConfig.motion.hiddenOffsetPx.mobile + "px",
    "--osint-desktop-hidden": mascotConfig.motion.hiddenOffsetPx.desktop + "px",
    "--osint-lift": mascotConfig.motion.companionLiftPx + "px",
    "--osint-x": `${snapshot.xPercent - 50}vw`,
    "--osint-transition-ms": `${snapshot.transitionMs}ms`,
    "--osint-action-ms": `${snapshot.actionMs}ms`,
  } as CSSProperties

  return (
    <div className="osint-mascot-boundary">
    <aside ref={dockRef} data-render-paused={renderPaused || snapshot.mode === "guarded" || snapshot.mode === "shy_wait"} aria-label="OSINT Hub mascot" className="osint-mascot-dock" data-mode={snapshot.mode}
      data-behavior={snapshot.behavior ?? "idle"} data-theme={theme} style={style}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && event.propertyName === "transform")
          enqueue({ type: "transition_end" })
      }}>
      <button ref={buttonRef} type="button" className="osint-mascot-button"
        aria-label="與 OSINT Hub 桌寵互動"
        onPointerEnter={() => enqueue({ type: "hover", anchorX: anchorX() })}
        onPointerLeave={() => enqueue({ type: "hover_leave" })}
        onClick={() => enqueue({ type: "tap", at: Date.now(), anchorX: anchorX() })}>
        <span className="osint-mascot-stage" aria-hidden="true">
          <span className="osint-mascot-core">
            <img className="osint-mascot-plate" src={plate} alt="" draggable={false} />
            <span className="osint-mascot-sprout" style={{
              left: mascotConfig.core.sprout.left,
              top: mascotConfig.core.sprout.top,
              width: mascotConfig.core.sprout.displayWidth,
              height: mascotConfig.core.sprout.displayHeight,
              transformOrigin: mascotConfig.core.sprout.pivot,
            }}><img src={sprout} alt="" draggable={false} /></span>
            {Object.entries(mascotConfig.slots).map(([id, slot]) => (
              <span key={id} className={`osint-mascot-slot osint-mascot-${id}`} style={{
                ...("left" in slot ? { left: slot.left } : { right: slot.right }),
                top: slot.top, width: slot.width, zIndex: slot.zIndex,
                transform: slot.transform, transformOrigin: slot.pivot,
              }}><img src={theme === "dark" ? slot.dark : slot.light} alt="" draggable={false} /></span>
            ))}
            <span className="osint-mascot-eyes">
              {mascotConfig.core.eyes.map((eye, index) => {
                const extent = eye.haloRadius + 6.5
                const size = extent * 2
                return <span className="osint-mascot-eye" key={index} style={{
                  left: `${(eye.x - extent) / mascotConfig.core.width * 100}%`,
                  top: `${(eye.y - extent) / mascotConfig.core.height * 100}%`,
                  width: `${size / mascotConfig.core.width * 100}%`,
                  height: `${size / mascotConfig.core.height * 100}%`,
                }}>
                  <svg viewBox={`0 0 ${size} ${size}`}>
                    <circle className="osint-mascot-eye-halo" cx={extent} cy={extent} r={eye.haloRadius} />
                    <circle className="osint-mascot-eye-moon" cx={extent} cy={extent} r={eye.moonRadius} />
                  </svg>
                </span>
              })}
            </span>
            <span className="osint-mascot-cheek osint-mascot-cheek-left" />
            <span className="osint-mascot-cheek osint-mascot-cheek-right" />
          </span>
        </span>
      </button>
    </aside>
    </div>
  )
}
