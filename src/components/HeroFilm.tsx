import Box from '@mui/material/Box'
import { keyframes, useTheme } from '@mui/material/styles'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { useRef } from 'react'
import { MONO_FONT } from './DiffVersusRun.tsx'
import { heroSequence, motionEasing } from '../motion.ts'
import { displayFont } from '../theme.ts'
import { capture } from '../posthog.ts'
import poster from '../assets/film-poster.webp'
import filmWebm from '../assets/film/counterbranch-reel.webm'
import filmMp4 from '../assets/film/counterbranch-reel.mp4'

/**
 * The hero's figure: the Counterbranch film, shown as its own still with a
 * play plate in the frame. It runs 2:45 with sound, so it never plays on its
 * own beside the headline's reel; a press opens it full size in a modal
 * player that grows out of the still and shrinks back into it on close.
 *
 * Two encodes of the same cut: AV1 and Opus in WebM, about a third smaller,
 * for browsers that can decode it, and H.264 and AAC in MP4 for everything
 * else. Neither is fetched until the film is opened.
 */

const DURATION = '2:45'

/** The film's own near-black, so the frame never flashes the page colour. */
const SCREEN = '#05070D'

/** The plate's cyan is the logo's, in both schemes: it sits on the film's dark still. */
const PLATE = { background: '#00E8FC', ink: '#0B1220' }

/** The frame opens out from its centre while the still settles inside it. */
const frameOpen = keyframes`
  from { clip-path: inset(7% 7% 7% 7%); }
  to { clip-path: inset(0 0 0 0); }
`
const stillSettle = keyframes`
  from { transform: scale(1.14); }
  to { transform: scale(1); }
`

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** The transform that lays `to` over `from`, scaled from the top left. */
function lay(from: DOMRect, to: DOMRect) {
  return `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})`
}

export default function HeroFilm() {
  const theme = useTheme()
  const hero = theme.vars.palette.hero
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const closing = useRef(false)

  const open = () => {
    const [trigger, dialog, frame, video] = [triggerRef.current, dialogRef.current, frameRef.current, videoRef.current]
    if (!trigger || !dialog || !frame || !video) return
    closing.current = false
    dialog.showModal()
    if (video.ended) video.currentTime = 0
    // Started inside the press, so it plays with sound. Where a browser still
    // refuses, the player's own controls stay on screen to start it by hand.
    video.play().catch(() => {})
    capture('hero_film_opened')
    if (reducedMotion()) return
    frame.animate([{ transform: lay(trigger.getBoundingClientRect(), frame.getBoundingClientRect()) }, { transform: 'none' }], {
      duration: 560,
      easing: motionEasing.decel,
    })
    dialog.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 360, pseudoElement: '::backdrop' })
  }

  const close = () => {
    const [trigger, dialog, frame, video] = [triggerRef.current, dialogRef.current, frameRef.current, videoRef.current]
    if (!trigger || !dialog || !frame || !video || closing.current) return
    video.pause()
    if (reducedMotion()) return dialog.close()
    closing.current = true
    const shrink = frame.animate(
      [
        { transform: 'none', opacity: 1 },
        { opacity: 1, offset: 0.75 },
        { transform: lay(trigger.getBoundingClientRect(), frame.getBoundingClientRect()), opacity: 0 },
      ],
      { duration: 420, easing: motionEasing.inOut, fill: 'forwards' },
    )
    const fade = dialog.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 420,
      pseudoElement: '::backdrop',
      fill: 'forwards',
    })
    shrink.onfinish = () => {
      dialog.close()
      shrink.cancel()
      fade.cancel()
    }
  }

  return (
    <>
      <Box
        component="button"
        type="button"
        ref={triggerRef}
        onClick={open}
        aria-haspopup="dialog"
        aria-label={`Watch the film, ${DURATION}, with sound`}
        sx={{
          position: 'relative',
          display: 'block',
          width: '100%',
          aspectRatio: '16 / 9',
          p: 0,
          // Set on the hero's plate, like the headline's reel word: ink on
          // the cyan flood, white on the dark hero. The film's cyan still
          // would otherwise run straight into the cyan flood.
          border: { xs: '6px solid', md: '8px solid' },
          borderColor: hero.plate,
          overflow: 'hidden',
          cursor: 'pointer',
          bgcolor: SCREEN,
          color: PLATE.ink,
          // A navy-tinted fall-off under the plate on the cyan flood.
          boxShadow: '0 32px 64px -32px rgba(11, 18, 32, 0.6), 0 12px 24px -12px rgba(11, 18, 32, 0.3)',
          ...theme.applyStyles('dark', { boxShadow: 'none' }),
          animation: `${frameOpen} ${heroSequence.filmMs}ms ${motionEasing.decel} ${heroSequence.film}ms both`,
          '& img': {
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            animation: `${stillSettle} ${heroSequence.filmMs + 300}ms ${motionEasing.decel} ${heroSequence.film}ms both`,
          },
          '& [data-part="still"]': { transition: `transform 900ms ${motionEasing.decel}` },
          '& [data-part="plate"]': { transition: `background-color 150ms, transform 240ms ${motionEasing.decel}` },
          '& [data-part="play"]': { transition: `transform 240ms ${motionEasing.decel}` },
          '@media (hover: hover)': {
            '&:hover [data-part="still"]': { transform: 'scale(1.04)' },
            '&:hover [data-part="plate"]': { backgroundColor: '#FFFFFF' },
            '&:hover [data-part="play"]': { transform: 'scale(1.18)' },
          },
          '&:active [data-part="plate"]': { transform: 'scale(0.97)' },
          '&:focus-visible': { outline: '3px solid', outlineColor: hero.ink, outlineOffset: 4 },
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
            '& img': { animation: 'none' },
            '& [data-part]': { transition: 'none' },
          },
        }}
      >
        <Box data-part="still" sx={{ position: 'absolute', inset: 0 }}>
          <img src={poster} alt="" width={1600} height={899} decoding="async" />
        </Box>
        <Box
          data-part="plate"
          aria-hidden
          sx={{
            position: 'absolute',
            left: { xs: 12, md: 20 },
            bottom: { xs: 12, md: 20 },
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            height: { xs: 40, md: 48 },
            pl: 1,
            pr: 2,
            bgcolor: PLATE.background,
            // The site's button face, as on the hero's own buttons.
            fontFamily: displayFont,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontSize: { xs: '0.875rem', md: '1rem' },
            lineHeight: 1,
            transformOrigin: 'left bottom',
          }}
        >
          <PlayArrowRoundedIcon data-part="play" sx={{ fontSize: { xs: 26, md: 30 } }} />
          Watch the film
          <Box
            component="span"
            sx={{
              ml: 0.75,
              pl: 1.25,
              borderLeft: '1px solid rgba(11, 18, 32, 0.3)',
              fontFamily: MONO_FONT,
              fontSize: '0.8125rem',
              fontWeight: 500,
              letterSpacing: 0,
              textTransform: 'none',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {DURATION}
          </Box>
        </Box>
      </Box>

      <Box
        component="dialog"
        ref={dialogRef}
        aria-label="Counterbranch film"
        onCancel={(event) => {
          event.preventDefault()
          close()
        }}
        onClose={() => videoRef.current?.pause()}
        // A press on the dimmed page around the player lands on the dialog itself.
        onClick={(event) => event.target === event.currentTarget && close()}
        sx={{
          p: 0,
          m: 'auto',
          border: 0,
          overflow: 'visible',
          bgcolor: 'transparent',
          maxWidth: 'none',
          maxHeight: 'none',
          // As large as fits under the close control, to 16:9 and 1600px.
          width: 'min(92vw, 1600px, calc((100svh - 144px) * 16 / 9))',
          '&::backdrop': {
            backgroundColor: 'rgba(5, 7, 13, 0.88)',
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        <Box ref={frameRef} sx={{ position: 'relative', transformOrigin: '0 0', willChange: 'transform' }}>
          <Box
            component="button"
            type="button"
            onClick={close}
            aria-label="Close the film"
            sx={{
              position: 'absolute',
              right: 0,
              bottom: 'calc(100% + 12px)',
              display: 'grid',
              placeItems: 'center',
              width: 44,
              height: 44,
              p: 0,
              border: '1px solid rgba(255, 255, 255, 0.24)',
              bgcolor: 'transparent',
              color: '#FFFFFF',
              cursor: 'pointer',
              transition: 'background-color 150ms, color 150ms',
              '&:hover': { bgcolor: PLATE.background, color: PLATE.ink, borderColor: PLATE.background },
              '&:focus-visible': { outline: '3px solid', outlineColor: PLATE.background, outlineOffset: 3 },
            }}
          >
            <CloseRoundedIcon />
          </Box>
          <Box
            component="video"
            ref={videoRef}
            controls
            playsInline
            preload="none"
            poster={poster}
            sx={{ display: 'block', width: '100%', aspectRatio: '16 / 9', bgcolor: SCREEN }}
          >
            <source src={filmWebm} type='video/webm; codecs="av01.0.08M.08, opus"' />
            <source src={filmMp4} type="video/mp4" />
          </Box>
        </Box>
      </Box>
    </>
  )
}
