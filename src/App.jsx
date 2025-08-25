import React, { useEffect, useState, useRef, useCallback } from 'react'
import { TypeAnimation } from 'react-type-animation'
import ParticlesBackground from './ParticlesBackground.jsx'
import Box from '@mui/material/Box'
import { Upload, Image as ImageIcon, Video, Play, Pause } from 'lucide-react'
import { Slider, Tooltip, IconButton, FormControlLabel, Switch, Typography, Button, Stack, Snackbar, Alert } from '@mui/material'

const asciiChars = '@%#*+=-:. '

const App = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [asciiArt, setAsciiArt] = useState('')
  const inputRef = useRef()
  const [isDragging, setIsDragging] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // 🎛️ CONTROLES
  const [charWidth, setCharWidth] = useState(100)
  const [lineHeight, setLineHeight] = useState(6)
  const [fontSize, setFontSize] = useState(6)
  const [invert, setInvert] = useState(false)
  const [mode, setMode] = useState('image')
  const [videoFile, setVideoFile] = useState(null)
  const videoRef = useRef(null)
  const requestRef = useRef()

  const handleReset = () => {
    setSelectedImage(null)
    setVideoFile(null)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.src = ''
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current)
    }
    setCharWidth(100)
    setFontSize(6)
    setAsciiArt('')
    setInvert(false)
    setLineHeight(6)
    setIsPlaying(false)
  }

  const handleCopy = async () => {
    if (asciiArt) {
      try {
        await navigator.clipboard.writeText(asciiArt)
        setCopied(true)
      } catch (err) {
        console.error('Erro ao copiar: ', err)
      }
    }
  }

  const handleVideo = (file) => {
    const url = URL.createObjectURL(file)
    setVideoFile(url)
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused || videoRef.current.ended) {
        videoRef.current.play()
        setIsPlaying(true)
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }

  const convertFrameToAscii = useCallback(() => {
    if (!videoRef.current || videoRef.current.readyState !== 4) return

    const video = videoRef.current
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    const scale = charWidth / video.videoWidth
    const height = Math.floor(video.videoHeight * scale * 0.5)

    canvas.width = charWidth
    canvas.height = height

    ctx.drawImage(video, 0, 0, charWidth, height)

    const imageData = ctx.getImageData(0, 0, charWidth, height)
    const pixels = imageData.data

    let ascii = ""
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < charWidth; x++) {
        const i = (y * charWidth + x) * 4
        const avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3
        const index = Math.floor((avg / 255) * (asciiChars.length - 1))
        ascii += invert
          ? asciiChars[asciiChars.length - 1 - index]
          : asciiChars[index]
      }
      ascii += "\n"
    }

    setAsciiArt(ascii)

    if (!video.paused && !video.ended) {
      requestRef.current = requestAnimationFrame(convertFrameToAscii)
    }
  }, [charWidth, invert])

  useEffect(() => {
    if (videoFile && videoRef.current) {
      const video = videoRef.current
      video.src = videoFile

      video.addEventListener('loadeddata', () => {
        convertFrameToAscii()
      })

      video.addEventListener('play', () => {
        setIsPlaying(true)
        convertFrameToAscii()
      })

      video.addEventListener('pause', () => {
        setIsPlaying(false)
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current)
        }
      })

      video.addEventListener('ended', () => {
        setIsPlaying(false)
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current)
        }
      })
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [videoFile, convertFrameToAscii])

  useEffect(() => {
    if (selectedImage) {
      const img = new Image()
      img.src = selectedImage
      img.onload = () => {
        convertToAscii(img)
      }
    }
  }, [charWidth, invert, selectedImage])

  const convertToAscii = (image) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const scale = charWidth / image.width
    const height = Math.floor(image.height * scale * 0.5)

    canvas.width = charWidth
    canvas.height = height
    ctx.drawImage(image, 0, 0, charWidth, height)

    const imageData = ctx.getImageData(0, 0, charWidth, height)
    const pixels = imageData.data

    let ascii = ''
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < charWidth; x++) {
        const i = (y * charWidth + x) * 4
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        const avg = (r + g + b) / 3
        const index = Math.floor((avg / 255) * (asciiChars.length - 1))
        const char = invert
          ? asciiChars[asciiChars.length - 1 - index]
          : asciiChars[index]
        ascii += char
      }
      ascii += '\n'
    }

    setAsciiArt(ascii)
  }

  const handleImage = (file) => {
    const url = URL.createObjectURL(file)
    setSelectedImage(url)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (mode === "image" && file.type.startsWith("image/")) {
        handleImage(file)
      } else if (mode === "video" && file.type.startsWith("video/")) {
        handleVideo(file)
      }
    }
  }, [mode])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (mode === "image" && file.type.startsWith("image/")) {
      handleImage(file)
    } else if (mode === "video" && file.type.startsWith("video/")) {
      handleVideo(file)
    }
  }

  const handleClick = () => {
    inputRef.current.click()
  }

  return (
    <div className='container'>
      <ParticlesBackground />

      <Box mb={4} textAlign="center">
  <TypeAnimation
      key={mode} // ← força reinicialização ao mudar mode

    sequence={[
      mode === "image" 
        ? 'Selecione a imagem que almeja converter em ASCII!' 
        : 'Selecione o vídeo que almeja converter em ASCII!', 
      1000
    ]}
    wrapper="h1"
    speed={50}
    repeat={Infinity}
  />
</Box>


      <Box className='Controls'>
        <Box width={200}>
          <Typography variant="caption">Largura (caracteres)</Typography>
          <Slider className='Sliders'
            min={40}
            max={200}
            color='green'
            step={10}
            value={charWidth}
            onChange={(e, val) => setCharWidth(val)}
          />
        </Box>

        <Box width={200}>
          <Typography variant="caption">Altura da linha</Typography>
          <Slider className='Sliders'
            min={5}
            max={20}
            step={1}
            value={lineHeight}
            onChange={(e, val) => setLineHeight(val)}
          />
        </Box>

        <Box width={200}>
          <Typography variant="caption">Tamanho da fonte</Typography>
          <Slider className='Sliders'
            min={4}
            max={16}
            step={1}
            value={fontSize}
            onChange={(e, val) => setFontSize(val)}
          />
        </Box>

        <FormControlLabel
          control={<Switch checked={invert} onChange={() => setInvert(!invert)} sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#4caf50',
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: '#4caf50',
            },
          }} />}
          label="Inverter contraste"
        />
      </Box>

      <Box display="flex" justifyContent="center" alignItems="flex-start" gap={2} mt={4}>
        <Box

          marginLeft={102}
          marginTop={40}
          display="flex"
          position='absolute'
          flexDirection="column"
          alignItems="center"
          gap={1}
          sx={{
            backgroundColor: '#6666668c',
            borderRadius: '10px',
            border: '0.1px solid #dbdbdbff',
          }}
        >
          <Tooltip title="Converter Imagem">
            <IconButton
              onClick={() => {
                setMode("image")
                handleReset()
              }}
              color={mode === "image" ? "success" : "default"}
            >
              <ImageIcon size={22} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Converter Vídeo">
            <IconButton
              onClick={() => {
                setMode("video")
                handleReset()
              }}
              color={mode === "video" ? "success" : "default"}
            >
              <Video size={22} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box
          className='ImageContainer'
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          sx={{
            minWidth: 500,
            minHeight: 300,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column'
          }}
        >
          {mode === "image" && selectedImage && (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontSize: `${fontSize}px`,
                lineHeight: `${lineHeight}px`,
                textAlign: "center",
                margin: 0,
                padding: '10px'
              }}
            >
              {asciiArt}
            </pre>
          )}

          {mode === "video" && videoFile && (
            <>
              <video
                ref={videoRef}
                style={{ display: "none" }}
              />
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: `${fontSize}px`,
                  lineHeight: `${lineHeight}px`,
                  textAlign: "center",
                  margin: 0,
                  padding: '10px'
                }}
              >
                {asciiArt}
              </pre>


            </>
          )}

          {((mode === "image" && !selectedImage) || (mode === "video" && !videoFile)) && (
            <Box className='BoxUpload' maxWidth='550px' padding='30px'>
              <Upload size='50' style={{ color: '#d9d9d9', marginBottom: '10px' }} />
              <p style={{ color: '#ddd', margin: '0 auto' }}>
                {mode === "image"
                  ? "Clique ou arraste uma imagem aqui"
                  : "Clique ou arraste um vídeo aqui"}
              </p>
            </Box>
          )}

          <input
            type="file"
            accept={mode === 'image' ? "image/*" : "video/*"}
            ref={inputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

        </Box>
        {/* Botão de play/pause fora do container de upload */}
        {mode === "video" && videoFile && (
          <Box display="flex" position="absolute" justifyContent="center" marginTop={52} marginLeft={102}>
                      <Tooltip title="Pausar/Reproduzir Vídeo">

            <IconButton
              onClick={togglePlayPause}
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                backgroundColor: '#38803aff',
                color: '#fff',
                '&:hover': { backgroundColor: '#43a047' },
              }}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      <Stack className='stack' direction="row" spacing={2} justifyContent="center" mt={2}>
        <Button variant="outlined" onClick={handleReset} className='ResetButton'
          sx={{
            borderColor: '#f44336',
            color: '#f44336',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#f44336',
              color: '#fff',
              borderColor: '#f44336',
            },
          }}>
          Limpar configurações
        </Button>
        <Button variant="contained" onClick={handleCopy} className="CopiedButton" disabled={!asciiArt}
          sx={{
            backgroundColor: '#38803aff',
            color: '#fff',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#43a047',
            },
            '&:disabled': {
              cursor: 'not-allowed',
              backgroundColor: '#494949ff',
              color: '#e0e0e0',
            },
          }}>
          Copiar ASCII
        </Button>
      </Stack>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setCopied(false)} severity="success" sx={{ width: '100%' }}>
          ASCII copiado para a área de transferência!
        </Alert>
      </Snackbar>
    </div>
  )
}

export default App