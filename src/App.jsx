import React, { useEffect, useState, useRef, useCallback } from 'react'
import { TypeAnimation } from 'react-type-animation'
import ParticlesBackground from './ParticlesBackground.jsx'
import Box from '@mui/material/Box'
import { Upload } from 'lucide-react'
import { Slider, FormControlLabel, Switch, Typography, Button, Stack, Snackbar, Alert } from '@mui/material'

const asciiChars = '@%#*+=-:. '

const App = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [asciiArt, setAsciiArt] = useState('')
  const inputRef = useRef()
  const [isDragging, setIsDragging] = useState(false)
  const [copied, setCopied] = useState(false)

  // 🎛️ CONTROLES
  const [charWidth, setCharWidth] = useState(100)
  const [lineHeight, setLineHeight] = useState(6)
  const [fontSize, setFontSize] = useState(6)
  const [invert, setInvert] = useState(false)



  const handleReset = () => {
    setSelectedImage(null)
    setCharWidth(100)
    setFontSize(6)
    setAsciiArt('')
    setInvert(false)
    setLineHeight(6)
  }

  const handleCopy = async () => {
    if (asciiArt) {
      try {
        await navigator.clipboard.writeText(asciiArt)
        setCopied(true);
      } catch (err) {
        console.error('Erro ao copiar: ', err)
      }
    }
  }
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

    const img = new Image()
    img.src = url
    img.onload = () => {
      convertToAscii(img)
    }
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImage(e.dataTransfer.files[0])
    }
  }, [charWidth, invert])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('image/')) {
      handleImage(file)
    }
  }//GitTest

  const handleClick = () => {
    inputRef.current.click()
  }

  return (
    <div className='container'>
      <ParticlesBackground />
      <TypeAnimation
        sequence={[
          'Selecione a imagem que almeja converter em ASCII!', 1000,

        ]}
        wrapper="h1"
        speed={50}
        repeat={Infinity}
      />
      <Box className='Controls'

      >
        <Box width={200}>
          <Typography variant="caption">Largura (caracteres)</Typography>
          <Slider className='Sliders'
            min={40}
            max={200}
            color='green'
            step={10}
            value={charWidth}
            onChange={(e, val) => setCharWidth(val)}
            onChangeCommitted={() => {
              if (selectedImage) handleImage({ name: 'temp', type: 'image/*', src: selectedImage })
            }}
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
              color: '#4caf50', // Cor do botão ativado
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: '#4caf50', // Cor da trilha quando ativado
            },
          }} />}
          label="Inverter contraste"

        />
      </Box>
      <Box className='ImageContainer'
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}>

        {selectedImage ? (

          <pre
            style={{
              whiteSpace: 'pre-wrap',
              fontSize: `${fontSize}px`,
              lineHeight: `${lineHeight}px`,
              textAlign: 'center',
            }}
          >
            {asciiArt}
          </pre>
        ) : (
          <>     <Box className='BoxUpload'>
            <Upload size='50' style={{ color: '#d9d9d9', marginBottom: '10px' }} />
            <p style={{ color: '#ddd', maxWidth: '250px', margin: '0 auto' }}>Clique ou arraste uma imagem aqui</p>
          </Box>
          </>

        )}
        <input type="file" accept='image/*' ref={inputRef} onChange={handleFileChange} style={{ display: 'none' }} />


      </Box>
      <Stack className='stack'direction="row" spacing={2} justifyContent="center" >
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
