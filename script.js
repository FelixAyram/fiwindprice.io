let mensajeEnviado = false;
let ultimoMensajePorcentaje = 0; // Para rastrear el último porcentaje de diferencia

function compararPrecios() {
    const url1 = "https://criptoya.com/api/fiwind/usdt/ars";
    const url2 = "https://criptoya.com/api/bybitp2p/usdt/ars/10";

    // Obtener el valor del input
    const porcentajeMinimo = parseFloat(document.getElementById('porcentajeMinimo').value);

    fetch(url1)
        .then(response => response.json())
        .then(data => {
            const buy_fiwind = data.totalAsk;
            const sell_fiwind = data.totalBid;
            document.getElementById('compraFiWind').textContent = buy_fiwind;
            document.getElementById('ventaFiWind').textContent = sell_fiwind;

            return fetch(url2).then(response => response.json())
                .then(data => {
                    const buy_bybit = data.totalBid;
                    const sell_bybit = data.totalAsk;
                    document.getElementById('compraBybit').textContent = buy_bybit;
                    document.getElementById('ventaBybit').textContent = sell_bybit;

                    const diferencia = (sell_fiwind / buy_bybit) - 1;
                    const porcentajeDiferencia = diferencia * 100;
                    document.getElementById('porcentajeDiferencia').textContent = porcentajeDiferencia.toFixed(2);

                    // Comprobar si la diferencia ha cruzado el umbral
                    if (porcentajeDiferencia > porcentajeMinimo && !mensajeEnviado) {
                        enviarTelegram("Hay diferencia de",porcentajeDiferencia, sell_fiwind, buy_bybit, "por encima");
                        mensajeEnviado = true;
                        ultimoMensajePorcentaje = porcentajeDiferencia;
                    } else if (porcentajeDiferencia <= porcentajeMinimo && mensajeEnviado) {
                        enviarTelegram("Ya no hay diferencia",porcentajeDiferencia, sell_fiwind, buy_bybit, "por debajo");
                        mensajeEnviado = false;
                    }
                });
        })
        .catch(error => console.error('Error:', error));
}

function enviarTelegram(direccion,porcentajeDiferencia, sell_fiwind, buy_bybit, estado) {
    const token = '5831740718:AAG9goizNBpjcENdV_Z1wMH5uoh0aeb-904';
    const chatId = '1105162571';
    const mensaje = `*${direccion}* ${porcentajeDiferencia.toFixed(2)}%\n\n*FiWind:*\n- Venta usdt: ${sell_fiwind}\n*Bybit:*\n- Comprar usdt: ${buy_bybit}\n\n*Estado:* ${estado}`;

    fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(mensaje)}&parse_mode=Markdown`)
        .then(response => {
            console.log('Mensaje enviado a Telegram');
            // Agregar el mensaje a la lista de mensajes enviados
            const listaMensajes = document.getElementById('listaMensajes');
            const nuevoMensaje = document.createElement('li');
            nuevoMensaje.textContent = mensaje;
            listaMensajes.appendChild(nuevoMensaje);
        })
        .catch(error => console.error('Error al enviar mensaje a Telegram:', error));
}

// Iniciar la comparación de precios automáticamente cada 10 segundos
setInterval(compararPrecios, 10000);
