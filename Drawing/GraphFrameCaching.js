let _cachingFrames = false
let _cachingTimeout = null

let _cachedFrames = []
let _currentFrame = 0

let _cacheTime = 0


// Função de resetar a coleta de frames
let _handleCacheResetEvent = () => {
    //console.log("reset")

    clearTimeout(_cachingTimeout)

    _cachingFrames = false
    _cachedFrames = []
    _currentFrame = 0
    _cacheTime = 0

    _cachingTimeout = setTimeout(() => {
        _cachingFrames = true
        _cacheTime = Date.now()
    }, 5000)
}
_handleCacheResetEvent()


/* Eventos que resetam o idle timer com qualquer ação */
document.addEventListener("mousedown", _handleCacheResetEvent)
document.addEventListener("keydown", _handleCacheResetEvent)
document.addEventListener("mousemove", _handleCacheResetEvent)
document.addEventListener("resize", _handleCacheResetEvent)

// Função resposável por cachear frames quando o canvas está idle
// Retorna true se um canvas cacheado foi desenhado e false caso contrário
export default function cacheFrames(currentFPS, idleFPS, ctx, canvas, drawGraph) {
    if(!_cachingFrames) {
        return false
    }

    if(currentFPS > idleFPS) {
        //console.log('greater')
        _cachedFrames = []
        _currentFrame = 0
        return false
    }

    // Mesma duração da animação de breathing, 4s
    const cacheDuration = 4000

    let frameTime = Date.now() - _cacheTime

    // Se frames o bastante já foram cacheados
    if(frameTime >= cacheDuration) {
        _currentFrame++
        if(_currentFrame === _cachedFrames.length) {
            _currentFrame = 0
        }


        let image = _cachedFrames[_currentFrame]
        // Se existe uma imagem cacheada e pronta
        if(image && image.complete) {
            //console.log('idle', _currentFrame)
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(image, 0, 0)
            return true
        }
        // Caso contrário, coletar mais frames
    } else {
        // Desenhar o grafo antes de coletar o frame 0
        if(_cachedFrames.length === 0) {
            drawGraph()
        }

        // Captura o canvas em uma nova imagem
        //console.log('collecting')
        let image = new Image()
        image.src = canvas.toDataURL()
        _cachedFrames.push(image)
    }
    return false
}