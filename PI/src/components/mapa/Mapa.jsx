import './mapa.css';

function Mapa () {
    // const totalCasas = 20; 
    const mapa = document.getElementById('mapa');
    
    // Cria os números de 1 a 20
    for (let i = 1; i <= 12; i++) {
        const item = document.createElement('div');
        item.className = 'item';
        item.textContent = i;
        mapa.appendChild(item);
    }

    return (
        <>
            <div class="mapa" id="mapa"></div>
        </>
    )
}

export default Mapa