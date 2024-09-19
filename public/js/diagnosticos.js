// Url de la API
const api_url = 'https://diagnostico-cna.onrender.com'
// const api_url = 'https://diagnostico-cna-e999d7fefc63.herokuapp.com'

// Funcion que carga los formularios desde otros archivos html
async function cargarFormulario(url) {
    const response = await fetch(url);
    const formularioHTML = await response.text();
    document.getElementById('formularioDiagnostico').innerHTML = formularioHTML;
}

function mostrarFormulario() {
    const tipoDiagnostico = document.querySelector('input[name="tipoDiagnostico"]:checked').value;
    const formularioDiagnostico = document.getElementById('formularioDiagnostico');

    let formularioHTML = '';

    if (tipoDiagnostico === 'emisiones') {
        cargarFormulario('./forms/emisiones.html');
    } else if (tipoDiagnostico === 'obd') {
        cargarFormulario('./forms/obd.html');
    } else if (tipoDiagnostico === 'visual') {
        cargarFormulario('./forms/visual.html');
    } else if (tipoDiagnostico === 'especs-mecanicas') {
        formularioDiagnostico.innerHTML = `
        <div class="w-full px-2 py-3 flex flex-col">
            <span class="text-lg font-bold text-gray-800">
                El vehiculo no cumple con las especificaciones mecanicas.
            </span>
        </div>
        `;
    }
}

function cambiarEmisiones() {
    const selectProtocolo = document.getElementById('protocolo');
    const emisiones1_text = document.getElementById('emisiones-1');
    const emisiones2_text = document.getElementById('emisiones-2');

    if (selectProtocolo.value === '7') {
        emisiones1_text.textContent = 'PASS5024';
        emisiones2_text.textContent = 'PASS2540';
    } else if (selectProtocolo.value === '2') {
        emisiones1_text.textContent = 'Ralentí';
        emisiones2_text.textContent = 'Crucero';
    }
}

document.getElementById('btnGenerarDiagnostico').addEventListener('click', function() {

    // Alerta de carga
    Swal.fire({
        width: 100,
        didOpen: () => {
            Swal.showLoading();
        },
        allowOutsideClick: false
    });

    const tipoDiagnostico = document.querySelector('input[name="tipoDiagnostico"]:checked').value;

    var form_emisiones = document.getElementById("vehicleForm");
    var datos = new FormData(form_emisiones);
    if (tipoDiagnostico === 'emisiones') {
        get_dx_emi(datos);
    }else if (tipoDiagnostico === 'obd') {
        
        var catalitico = document.getElementById('catalitico').checked ? 1 : 0;
        var combustible = document.getElementById('obd_combustible').checked ? 1 : 0;
        var cilindros = document.getElementById('cilindros').checked ? 1 : 0;
        var integrales = document.getElementById('integrales').checked ? 1 : 0;
        var oxigeno = document.getElementById('oxigeno').checked ? 1 : 0;

        var obds = [catalitico, combustible, cilindros, integrales, oxigeno]

        get_dx_obd(datos, obds)

    }else if (tipoDiagnostico === 'visual') {
        var filtro_aire =  document.getElementById('filtro-aire').checked ? 1 : 0;
        var tapon_combustible =  document.getElementById('tapon-combustible').checked ? 1 : 0;
        var sistema_escape =  document.getElementById('sistema-escape').checked ? 1 : 0;
        var tapon_aceite =  document.getElementById('tapon-aceite').checked ? 1 : 0;
        var neumaticos =  document.getElementById('neumaticos').checked ? 1 : 0;
        var fuga_refrigerante =  document.getElementById('fuga-refrigerante').checked ? 1 : 0;
        var bayoneta =  document.getElementById('bayoneta').checked ? 1 : 0;
        var componentes_alterados =  document.getElementById('componentes-alterados').checked ? 1 : 0;

        var visuales = [sistema_escape, filtro_aire, tapon_aceite, tapon_combustible,
            bayoneta, fuga_refrigerante, neumaticos, componentes_alterados
        ];

        get_dx_visual(datos, visuales);
    }
});


function get_dx_emi(data) {

    console.log(data.get('combustible'));
    console.log(data.get('protocolo'));

    const url = api_url + '/api/v1/diagnosticoCNA/generar';
    const data_emisions = {
        "placas": data.get('placas'),
        "serie": data.get('serie'),
        "marca": data.get('marca'),
        "submarca": data.get('submarca'),
        "modelo": data.get('modelo'),
        "combustible": data.get('combustible'),
        "protocolo": data.get('protocolo'),
        "emisiones_prueba1": {
            "hc": data.get('hc_5024'),
            "o2": data.get('o2_5024'),
            "co": data.get('co_5024'),
            "co2": data.get('co2_5024'),
            "dilucion": data.get('dilucion_5024'),
            "nox": data.get('nox_5024'),
            "Lambda": data.get('lambda_5024')
        },
        "emisiones_prueba2": {
            "hc": data.get('hc_2540'),
            "o2": data.get('o2_2540'),
            "co": data.get('co_2540'),
            "co2": data.get('co2_2540'),
            "dilucion": data.get('dilucion_2540'),
            "nox": data.get('nox_2540'),
            "Lambda": data.get('lambda_2540')
        }
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data_emisions)
    })
    .then(response => response.json())
    .then(data => {
        
        // Valida si el vehiculo esta en buenas condiciones
        if (data.estado != 0) {
            Swal.fire({
                title: '<p class="text-2xl">Aviso</p>',
                html: '<p class="text-lg">' + data.des_estado +
                    ' Por lo que no se puede generar un diagnóstico valido.</p>',
                icon: 'warning',
                confirmButtonText: '<p class="font-bold text-lg">Aceptar</p>',
                confirmButtonColor: '#406959',
                focusConfirm: true
            });

            return;
        }

        // Decodificar la cadena base64
        var binaryString = atob(data.pdf_b64);

        // Convertir la cadena decodificada en un array buffer
        var length = binaryString.length;
        var bytes = new Uint8Array(length);
        for (var i = 0; i < length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Crear un blob a partir del array buffer
        var blob = new Blob([bytes], { type: 'application/pdf' });

        // Crear una URL para el blob
        var url = URL.createObjectURL(blob);

        // Se cierra el Swal antes de abrir el PDF
        Swal.close();

        // Muestra el Swal de éxito
        Swal.fire({
            title: '<p class="text-2xl">Éxito</p>',
            html: '<p class="text-lg">Diagnóstico generado correctamente</p>',
            icon: 'success',
            confirmButtonText: '<p class="font-bold text-lg">Aceptar</p>',
            confirmButtonColor: '#406959',
            focusConfirm: true
        });

        // Abrir el PDF en una nueva ventana
        window.open(url);

    })
    .catch(error => {

        //Cierra el Swal cuando se resuelve de manera erronea
        Swal.close();

        // Muestra el Swal de error
        Swal.fire({
            title: '<p class="text-2xl">Error</p>',
            html: '<p class="text-lg">Error durante el proceso: <span>'+ error +'</span></p>',
            icon: 'error',
            confirmButtonText: '<p class="font-bold text-lg">Aceptar</p>',
            confirmButtonColor: '#b8123d',
            focusConfirm: true
        });

        console.error('Error:', error);
    });
}

function get_dx_obd(datos, obds) {

    const url = api_url + '/api/v1/diagnosticoCNA/generarOBD';
    const data = {
        "placas": datos.get('placas'),
        "serie": datos.get('serie'),
        "marca": datos.get('marca'),
        "submarca": datos.get('submarca'),
        "modelo": datos.get('modelo'),
        "monitores_obd": {
            "obd_catalitico": obds[0],
            "obd_combustible": obds[1],
            "obd_cilindros": obds[2],
            "obd_integrales": obds[3],
            "obd_oxigeno": obds[4]
        }
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {

        // Valida si el vehiculo esta en buenas condiciones
        if (data.estado != 0) {
            Swal.fire({
                title: '<p class="text-2xl">Aviso</p>',
                html: '<p class="text-lg">' + data.des_estado +
                    ' Por lo que no se puede generar un diagnóstico valido.</p>',
                icon: 'warning',
                confirmButtonText: '<p class="font-bold text-lg">Aceptar</p>',
                confirmButtonColor: '#406959',
                focusConfirm: true
            });

            return;
        }

        // Decodificar la cadena base64
        var binaryString = atob(data.pdf_b64);

        // Convertir la cadena decodificada en un array buffer
        var length = binaryString.length;
        var bytes = new Uint8Array(length);
        for (var i = 0; i < length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Crear un blob a partir del array buffer
        var blob = new Blob([bytes], { type: 'application/pdf' });

        // Se cierra el Swal antes de abrir el PDF
        Swal.close();

        // Muestra el Swal de éxito
        Swal.fire({
            title: '<p class="text-2xl">Éxito</p>',
            html: '<p class="text-lg">Diagnóstico generado correctamente</p>',
            icon: 'success',
            confirmButtonText: '<p class="font-bold text-lg">Aceptar</p>',
            confirmButtonColor: '#406959',
            focusConfirm: true
        });

        // Crear una URL para el blob
        var url = URL.createObjectURL(blob);

        // Abrir el PDF en una nueva ventana
        window.open(url);

    })
    .catch(error => {

        //Cierra el Swal cuando se resuelve de manera erronea
        Swal.close();

        // Muestra el Swal de error
        Swal.fire({
            title: '<p class="text-2xl">Error</p>',
            html: '<p class="text-lg">Error durante el proceso: <span>'+ error +'</span></p>',
            icon: 'error',
            confirmButtonText: '<p class="font-bold text-lg">Aceptar</p>',
            confirmButtonColor: '#b8123d',
            focusConfirm: true
        });

        console.error('Error:', error);
    });
}

// Funcion que genera el diagnostico de inspeccion visual mediante la API
function get_dx_visual(datos, visuales) {
    const url = api_url + '/api/v1/diagnosticoCNA/generarVisual';
    const data = {
        "placas": datos.get('placas'),
        "serie": datos.get('serie'),
        "marca": datos.get('marca'),
        "submarca": datos.get('submarca'),
        "modelo": datos.get('modelo'),
        "dispositivos_visual": {
            "v_escape": visuales[0],
            "v_filtro": visuales[1],
            "v_taceite": visuales[2],
            "v_tcombustible": visuales[3],
            "v_bayoneta": visuales[4],
            "v_fluidos": visuales[5],
            "v_neumaticos": visuales[6],
            "v_cemisiones": visuales[7]
        }
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {

        // Valida si el vehiculo esta en buenas condiciones
        if (data.estado != 0) {
            Swal.fire({
                title: '<p class="text-2xl">Aviso</p>',
                html: '<p class="text-lg">' + data.des_estado +
                    ' Por lo que no se puede generar un diagnóstico valido.</p>',
                icon: 'warning',
                confirmButtonText: '<p class="font-bold text-lg">Aceptar</p>',
                confirmButtonColor: '#406959',
                focusConfirm: true
            });

            return;
        }

        // Decodificar la cadena base64
        var binaryString = atob(data.pdf_b64);

        // Convertir la cadena decodificada en un array buffer
        var length = binaryString.length;
        var bytes = new Uint8Array(length);
        for (var i = 0; i < length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Crear un blob a partir del array buffer
        var blob = new Blob([bytes], { type: 'application/pdf' });

        // Se cierra el Swal antes de abrir el PDF
        Swal.close();

        // Muestra el Swal de éxito
        Swal.fire({
            title: '<p class="text-2xl">Éxito</p>',
            html: '<p class="text-lg">Diagnóstico generado correctamente</p>',
            icon: 'success',
            confirmButtonText: '<p class="font-bold text-lg">Aceptar</p>',
            confirmButtonColor: '#406959',
            focusConfirm: true
        });

        // Crear una URL para el blob
        var url = URL.createObjectURL(blob);

        // Abrir el PDF en una nueva ventana
        window.open(url);

    })
    .catch(error => {

        //Cierra el Swal cuando se resuelve de manera erronea
        Swal.close();

        // Muestra el Swal de error
        Swal.fire({
            title: '<p class="text-2xl">Error</p>',
            html: '<p class="text-lg">Error durante el proceso: <span>'+ error +'</span></p>',
            icon: 'error',
            confirmButtonText: '<p class="font-bold text-lg">Aceptar</p>',
            confirmButtonColor: '#b8123d',
            focusConfirm: true
        });

        console.error('Error:', error);
    });
}