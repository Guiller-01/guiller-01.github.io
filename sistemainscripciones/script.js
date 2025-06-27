document.addEventListener('DOMContentLoaded', () => {
  let estudiantes = [];

  const formulario = document.getElementById('formulario');
  const btnMostrarFormulario = document.getElementById('mostrarFormulario');

  btnMostrarFormulario.addEventListener('click', () => {
    formulario.classList.toggle('visible');
    btnMostrarFormulario.textContent = formulario.classList.contains('visible')
      ? 'Ocultar formulario'
      : 'Inscribir nuevo estudiante';
  });

  formulario.addEventListener('submit', function (e) {
    e.preventDefault();

    const estudiante = {
      nombre: document.getElementById('nombre').value,
      edad: document.getElementById('edad').value,
      direccion: document.getElementById('direccion').value,
      telefono: document.getElementById('telefono').value,
      representante: document.getElementById('representante').value,
      telRepresentante: document.getElementById('tel_representante').value,
      institucion: document.getElementById('institucion').value,
      promedio: document.getElementById('promedio').value,
      carrera: document.getElementById('carrera').value,
      turno: document.getElementById('turno').value,
      sni: document.getElementById('sni').value
    };

    estudiantes.push(estudiante);
    mostrarEstudiantes();
    formulario.reset();
    formulario.classList.remove('visible');
    btnMostrarFormulario.textContent = 'Inscribir nuevo estudiante';
  });

  function mostrarEstudiantes() {
    const tbody = document.querySelector('#tablaEstudiantes tbody');
    tbody.innerHTML = '';

    estudiantes.forEach((est, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${est.nombre}</td>
        <td>${est.edad}</td>
        <td>${est.carrera}</td>
        <td>${est.turno}</td>
        <td>
          <span class="action-btn" onclick="editarEstudiante(${index})">Editar</span> |
          <span class="action-btn" onclick="eliminarEstudiante(${index})">Eliminar</span>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  window.eliminarEstudiante = function(index) {
    if (confirm('¿Estás seguro de eliminar este estudiante?')) {
      estudiantes.splice(index, 1);
      mostrarEstudiantes();
    }
  };

  window.editarEstudiante = function(index) {
    const est = estudiantes[index];
    document.getElementById('nombre').value = est.nombre;
    document.getElementById('edad').value = est.edad;
    document.getElementById('direccion').value = est.direccion;
    document.getElementById('telefono').value = est.telefono;
    document.getElementById('representante').value = est.representante;
    document.getElementById('tel_representante').value = est.telRepresentante;
    document.getElementById('institucion').value = est.institucion;
    document.getElementById('promedio').value = est.promedio;
    document.getElementById('carrera').value = est.carrera;
    document.getElementById('turno').value = est.turno;
    document.getElementById('sni').value = est.sni;

    estudiantes.splice(index, 1);
    mostrarEstudiantes();
    formulario.classList.add('visible');
    btnMostrarFormulario.textContent = 'Ocultar formulario';
  };
});
