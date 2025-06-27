document.addEventListener('DOMContentLoaded', () => {
    // --- Datos iniciales para el director ---
    const directorUser = {
        username: 'Director',
        password: 'Director25*',
        type: 'director'
    };

    let users = JSON.parse(localStorage.getItem('users')) || [];
    const directorExists = users.some(user => user.username === directorUser.username && user.type === 'director');
    if (!directorExists) {
        users.push(directorUser);
        localStorage.setItem('users', JSON.stringify(users));
    }

    // --- Lógica de registro de estudiante (mantener igual) ---
    const studentForm = document.getElementById('studentRegistrationForm');
    if (studentForm) {
        studentForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const student = {
                id: Date.now().toString(), // Generar un ID único para el estudiante
                name: document.getElementById('studentName').value.trim(),
                lastName: document.getElementById('studentLastName').value.trim(),
                idNumber: document.getElementById('studentID').value.trim(), // Cambiado a idNumber para evitar conflicto con el ID del objeto
                age: document.getElementById('studentAge').value,
                gender: document.getElementById('studentGender').value,
                representante: null,
                type: 'estudiante',
                gradeLevel: null, // Guardará 'primaria' o 'bachiller'
                grade: null, // El número de grado
                section: null,
                grades: {},
                status: 'pendiente' // ¡Nuevo campo: estado inicial 'pendiente'!
            };

            let students = JSON.parse(localStorage.getItem('students')) || [];
            // Validación por idNumber o por nombre/apellido
            const isDuplicate = students.some(s =>
                (student.idNumber && s.idNumber === student.idNumber) ||
                (s.name === student.name && s.lastName === student.lastName && !student.idNumber)
            );

            if (isDuplicate) {
                alert('Ya existe un estudiante con esta cédula o nombre y apellido. Por favor, verifique los datos.');
                return;
            }

            students.push(student);
            localStorage.setItem('students', JSON.stringify(students));

            alert('Estudiante registrado con éxito. Ahora registra al representante.');
            window.location.href = 'registro_r.html';
        });
    }

    // --- Lógica de registro de representante ---
    const representativeForm = document.getElementById('representativeRegistrationForm');
    if (representativeForm) {
        const existingRepresentativesSelect = document.getElementById('existingRepresentatives');
        const loadRepresentativesIntoSelect = () => {
            const representatives = JSON.parse(localStorage.getItem('representatives')) || [];
            existingRepresentativesSelect.innerHTML = '<option value="">-- Registrar Nuevo Representante --</option>';
            representatives.forEach((rep) => {
                const option = document.createElement('option');
                option.value = rep.id;
                option.textContent = `${rep.name} ${rep.lastName} (C.I: ${rep.id})`;
                existingRepresentativesSelect.appendChild(option);
            });
        };
        loadRepresentativesIntoSelect();
        existingRepresentativesSelect.addEventListener('change', (event) => {
            const selectedRepId = event.target.value;
            const representatives = JSON.parse(localStorage.getItem('representatives')) || [];
            if (selectedRepId === "") {
                representativeForm.reset();
                document.getElementById('repID').readOnly = false;
                document.getElementById('repUsername').readOnly = false;
                document.getElementById('repPassword').required = true;
                document.getElementById('repPassword').placeholder = '';
                // Habilitar campo de teléfono
                document.getElementById('repPhone').readOnly = false;
            } else {
                const selectedRep = representatives.find(rep => rep.id === selectedRepId);
                if (selectedRep) {
                    document.getElementById('repName').value = selectedRep.name;
                    document.getElementById('repLastName').value = selectedRep.lastName;
                    document.getElementById('repID').value = selectedRep.id;
                    document.getElementById('repAge').value = selectedRep.age;
                    document.getElementById('repEmail').value = selectedRep.email;
                    // Cargar valor del teléfono
                    document.getElementById('repPhone').value = selectedRep.phone || '';
                    document.getElementById('repUsername').value = selectedRep.username;
                    document.getElementById('repPassword').value = selectedRep.password;
                    document.getElementById('repID').readOnly = true;
                    document.getElementById('repUsername').readOnly = true;
                    document.getElementById('repPassword').required = false;
                    document.getElementById('repPassword').placeholder = 'Ya establecida';
                    // Deshabilitar campo de teléfono si es un representante existente
                    document.getElementById('repPhone').readOnly = true;
                    document.getElementById('repAssociatedStudent').value = '';
                }
            }
        });
        representativeForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const associatedStudentName = document.getElementById('repAssociatedStudent').value.trim();
            const repId = document.getElementById('repID').value.trim();
            const repName = document.getElementById('repName').value.trim();
            const repLastName = document.getElementById('repLastName').value.trim();
            const repUsername = document.getElementById('repUsername').value.trim();
            // Capturar el número de teléfono
            const repPhone = document.getElementById('repPhone').value.trim();

            let students = JSON.parse(localStorage.getItem('students')) || [];
            let foundStudentIndex = -1;
            for (let i = 0; i < students.length; i++) {
                if (students[i].name.toLowerCase() === associatedStudentName.toLowerCase()) {
                    foundStudentIndex = i;
                    break;
                }
            }
            if (foundStudentIndex === -1) {
                alert('Error: El estudiante "' + associatedStudentName + '" no está registrado. Por favor, registre al estudiante primero.');
                return;
            }
            if (students[foundStudentIndex].representante !== null && students[foundStudentIndex].representante !== '') {
                 alert('Error: El estudiante "' + associatedStudentName + '" ya tiene un representante asociado (' + students[foundStudentIndex].representante + '). Un alumno no puede tener más de un representante.');
                 return;
             }
            let representatives = JSON.parse(localStorage.getItem('representatives')) || [];
            let representativeToSave = null;
            const selectedExistingRepId = existingRepresentativesSelect.value;
            if (selectedExistingRepId === "") {
                const isRepIdDuplicate = representatives.some(r => r.id === repId);
                const isUsernameDuplicate = representatives.some(r => r.username === repUsername);
                if (isRepIdDuplicate) {
                    alert('Error: La cédula del representante ya está registrada. Si desea asociar otro alumno a este representante, selecciónelo de la lista "Representantes Existentes".');
                    return;
                }
                if (isUsernameDuplicate) {
                    alert('Error: El nombre de usuario ya está en uso. Por favor, elija otro.');
                    return;
                }
                representativeToSave = {
                    name: repName,
                    lastName: repLastName,
                    id: repId,
                    age: document.getElementById('repAge').value,
                    email: document.getElementById('repEmail').value.trim(),
                    phone: repPhone, // Añadido el campo de teléfono
                    username: repUsername,
                    password: document.getElementById('repPassword').value,
                    alumno_r: [associatedStudentName],
                    type: 'representante'
                };
                representatives.push(representativeToSave);
            } else {
                representativeToSave = representatives.find(r => r.id === selectedExistingRepId);
                if (!representativeToSave) {
                    alert('Error: No se encontró el representante existente.');
                    return;
                }
                if (!Array.isArray(representativeToSave.alumno_r)) {
                    representativeToSave.alumno_r = [];
                }
                if (!representativeToSave.alumno_r.includes(associatedStudentName)) {
                    representativeToSave.alumno_r.push(associatedStudentName);
                }
                // Si es un representante existente, no se modifica su información original (incluido el teléfono)
                // A menos que decidas permitir la edición de esos campos para representantes existentes.
                // Por ahora, solo se asocian nuevos alumnos.
            }
            students[foundStudentIndex].representante = representativeToSave.name;
            localStorage.setItem('students', JSON.stringify(students));
            localStorage.setItem('representatives', JSON.stringify(representatives));
            alert('Representante "' + representativeToSave.name + '" asociado exitosamente a "' + associatedStudentName + '"!');
            representativeForm.reset();
            document.getElementById('repID').readOnly = false;
            document.getElementById('repUsername').readOnly = false;
            document.getElementById('repPassword').required = true;
            document.getElementById('repPassword').placeholder = '';
            // Habilitar campo de teléfono
            document.getElementById('repPhone').readOnly = false;
            existingRepresentativesSelect.value = "";
            loadRepresentativesIntoSelect();
        });
    }

    // --- Lógica de Inicio de Sesión en index.html ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            // --- Director ---
            const directors = JSON.parse(localStorage.getItem('users')) || [];
            const foundDirector = directors.find(user => user.username === username && user.password === password && user.type === 'director');
            if (foundDirector) {
                // El director es un caso especial, puede que no tenga name/lastName directamente en el objeto 'users'.
                // Aseguramos que 'name' y 'lastName' estén presentes para 'loggedInUser'.
                localStorage.setItem('loggedInUser', JSON.stringify({
                    username: foundDirector.username,
                    password: foundDirector.password,
                    type: foundDirector.type,
                    name: 'Director', // Asumimos un nombre fijo o lo obtenemos si existe
                    lastName: '' // O un apellido si se registra alguno
                }));
                alert('¡Bienvenido, Director!');
                window.location.href = 'registro_m.html';
                return;
            }

            // --- Maestros ---
            const teachers = JSON.parse(localStorage.getItem('teachers')) || [];
            const foundTeacher = teachers.find(teacher => teacher.username === username && teacher.password === password && teacher.type === 'maestro');
            if (foundTeacher) {
                localStorage.setItem('loggedInUser', JSON.stringify({
                    username: foundTeacher.username,
                    password: foundTeacher.password,
                    type: foundTeacher.type,
                    name: foundTeacher.name, // Ya existente
                    lastName: foundTeacher.lastName, // Ya existente
                    subject: foundTeacher.subject,
                    gradeLevel: foundTeacher.gradeLevel,
                    gradeNumber: foundTeacher.gradeNumber,
                    section: foundTeacher.section
                }));
                alert('¡Bienvenido, Maestro ' + foundTeacher.name + '!');
                window.location.href = 'alumnos.html';
                return;
            }

            // --- Representantes ---
            const representatives = JSON.parse(localStorage.getItem('representatives')) || [];
            const foundRepresentative = representatives.find(rep => rep.username === username && rep.password === password && rep.type === 'representante');
            if (foundRepresentative) {
                localStorage.setItem('loggedInUser', JSON.stringify({
                    username: foundRepresentative.username,
                    password: foundRepresentative.password,
                    type: foundRepresentative.type,
                    name: foundRepresentative.name, // Ya existente
                    lastName: foundRepresentative.lastName, // Ya existente
                    alumno_r: foundRepresentative.alumno_r,
                    id: foundRepresentative.id, // También se puede necesitar el ID del representante
                    phone: foundRepresentative.phone // Aseguramos que el teléfono también esté disponible
                }));
                alert('¡Inicio de sesión exitoso! Bienvenido, ' + foundRepresentative.name + '.');
                window.location.href = 'datos.html';
            } else {
                alert('Usuario o contraseña incorrectos. Por favor, inténtelo de nuevo.');
            }
        });
    }

    // --- Lógica de la barra de navegación dinámica (MODIFICADA) ---
    const loggedInNavbar = document.getElementById('loggedInNavbar');
    if (loggedInNavbar) {
        const path = window.location.pathname;
        const pageName = path.split('/').pop();

        // Páginas que no requieren inicio de sesión
        const publicPages = ['index.html', 'registro_a.html', 'registro_r.html'];

        if (!publicPages.includes(pageName)) {
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

            if (!loggedInUser) {
                alert('Acceso no autorizado. Por favor, inicie sesión.');
                window.location.href = 'index.html';
                return;
            }

            let navLinksHTML = '';
            if (loggedInUser.type === 'representante') {
                navLinksHTML = `
                    <a href="datos.html" class="nav-link">Inicio</a>
                    <a href="notas.html" class="nav-link">Ver Notas</a>
                    <a href="pagos.html" class="nav-link">Notificar Pago</a>
                `;
            } else if (loggedInUser.type === 'director') {
                navLinksHTML = `
                    <a href="registro_m.html" class="nav-link">Registrar Maestro</a>
                    <a href="ver_pagos.html" class="nav-link">Ver Pagos</a>
                    <a href="inscribir.html" class="nav-link">Inscribir</a>
                `;
            } else if (loggedInUser.type === 'maestro') {
                navLinksHTML = `
                    <a href="alumnos.html" class="nav-link">Alumnos</a>
                    <a href="calificaciones.html" class="nav-link">Calificar Alumnos</a>
                `;
            }

            loggedInNavbar.innerHTML = `
                ${navLinksHTML}
                <a href="#" id="logoutButton" class="nav-link">Cerrar Sesión</a>
            `;

            document.getElementById('logoutButton').addEventListener('click', (event) => {
                event.preventDefault();
                localStorage.removeItem('loggedInUser');
                alert('Ha cerrado sesión.');
                window.location.href = 'index.html';
            });

            // --- Lógica de la vista de Datos (datos.html) - SOLO si el usuario es representante ---
            const studentDataList = document.getElementById('studentDataList');
            if (studentDataList && loggedInUser.type === 'representante') {
                const students = JSON.parse(localStorage.getItem('students')) || [];
                const associatedStudents = students.filter(student =>
                    loggedInUser.alumno_r && loggedInUser.alumno_r.includes(student.name)
                );

                if (associatedStudents.length > 0) {
                    studentDataList.innerHTML = '';
                    associatedStudents.forEach(student => {
                        const studentCard = document.createElement('div');
                        studentCard.className = 'student-card';
                        studentCard.innerHTML = `
                            <h2>${student.name} ${student.lastName}</h2>
                            <p><strong>Cédula:</strong> ${student.idNumber || 'N/A'}</p>
                            <p><strong>Edad:</strong> ${student.age}</p>
                            <p><strong>Género:</strong> ${student.gender}</p>
                            <p><strong>Grado:</strong> ${student.gradeLevel} ${student.grade || 'Pendiente'}</p>
                            <p><strong>Sección:</strong> ${student.section || 'Pendiente'}</p>
                        `;
                        studentDataList.appendChild(studentCard);
                    });
                } else {
                    studentDataList.innerHTML = '<p>No tienes alumnos asociados en este momento.</p>';
                }
            }
        } else {
            // Si es una página pública (registro_a.html o registro_r.html), asegurar que la navbar esté oculta o vacía
            loggedInNavbar.style.display = 'none'; // O puedes simplemente dejarla vacía si no quieres ocultarla
        }
    }

    // --- Lógica para el formulario de registro de maestro (registro_m.html) ---
    const teacherRegistrationForm = document.getElementById('teacherRegistrationForm');
    if (teacherRegistrationForm) {
        const gradeLevelSelect = document.getElementById('teacherGradeLevel');
        const gradeNumberSelect = document.getElementById('teacherGradeNumber');
        const sectionSelect = document.getElementById('teacherSection');

        const subjects = [
            'Matemáticas', 'Literatura', 'Física', 'Geografía',
            'Historia Universal', 'Biología', 'Educación Física', 'Historia de Venezuela'
        ];
        const subjectSelect = document.getElementById('teacherSubject');
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            subjectSelect.appendChild(option);
        });

        const populateSections = () => {
            sectionSelect.innerHTML = '<option value="">Seleccione Sección</option>';
            const letters = ['A', 'B', 'C'];
            for (let i = 1; i <= 9; i++) {
                letters.forEach(letter => {
                    const option = document.createElement('option');
                    option.value = `${letter}-${i}`;
                    option.textContent = `${letter}-${i}`;
                    sectionSelect.appendChild(option);
                });
            }
        };

        gradeLevelSelect.addEventListener('change', () => {
            gradeNumberSelect.innerHTML = '<option value="">Seleccione Grado</option>';
            const selectedLevel = gradeLevelSelect.value;
            if (selectedLevel === 'primaria') {
                for (let i = 1; i <= 6; i++) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.textContent = i;
                    gradeNumberSelect.appendChild(option);
                }
            } else if (selectedLevel === 'bachiller') {
                for (let i = 1; i <= 5; i++) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.textContent = i;
                    gradeNumberSelect.appendChild(option);
                }
            }
            populateSections();
        });

        teacherRegistrationForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const teacher = {
                name: document.getElementById('teacherName').value.trim(),
                lastName: document.getElementById('teacherLastName').value.trim(),
                id: document.getElementById('teacherID').value.trim(),
                email: document.getElementById('teacherEmail').value.trim(),
                username: document.getElementById('teacherUsername').value.trim(),
                password: document.getElementById('teacherPassword').value,
                subject: document.getElementById('teacherSubject').value,
                gradeLevel: gradeLevelSelect.value,
                gradeNumber: gradeNumberSelect.value,
                section: sectionSelect.value,
                type: document.getElementById('teacherType').value
            };

            let teachers = JSON.parse(localStorage.getItem('teachers')) || [];
            const isDuplicateID = teachers.some(t => t.id === teacher.id);
            const isDuplicateUsername = teachers.some(t => t.username === teacher.username);

            if (isDuplicateID) {
                alert('Error: Ya existe un maestro registrado con esta cédula.');
                return;
            }
            if (isDuplicateUsername) {
                alert('Error: El nombre de usuario ya está en uso. Por favor, elija otro.');
                return;
            }

            teachers.push(teacher);
            localStorage.setItem('teachers', JSON.stringify(teachers));

            alert('Maestro "' + teacher.name + ' ' + teacher.lastName + '" registrado con éxito.');
            teacherRegistrationForm.reset();
            gradeLevelSelect.value = '';
            gradeNumberSelect.innerHTML = '<option value="">Seleccione Grado</option>';
            sectionSelect.innerHTML = '<option value="">Seleccione Sección</option>';
        });
    }

    // --- Lógica para Notificar Pago (pagos.html) ---
    const paymentNotificationForm = document.getElementById('paymentNotificationForm');
    const monthlyPaymentSelect = document.getElementById('monthlyPaymentSelect');
    const selectedMonthToPayInput = document.getElementById('selectedMonthToPay'); // El input oculto

    if (paymentNotificationForm && monthlyPaymentSelect) {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

        if (!loggedInUser || loggedInUser.type !== 'representante') {
            alert('Acceso no autorizado. Por favor, inicie sesión como representante.');
            window.location.href = 'index.html';
            return;
        }

        // Definir las mensualidades del periodo estudiantil de Venezuela
        const academicMonths = [
            'Octubre', 'Noviembre', 'Diciembre', 'Enero', 'Febrero',
            'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio'
        ];

        const loadMonthlyPaymentsOptions = () => {
            const payments = JSON.parse(localStorage.getItem('payments')) || [];
            const representativePayments = payments.filter(p => p.notifiedBy === loggedInUser.username); // Filtrar pagos por el representante logeado

            // Obtener las mensualidades que ya han sido pagadas (aprobadas o pendientes) por este representante
            const paidOrPendingMonths = representativePayments
                .filter(p => p.status === 'aprobado' || p.status === 'pendiente')
                .map(p => p.monthPaid);

            monthlyPaymentSelect.innerHTML = '<option value="">-- Seleccione una Mensualidad --</option>';

            academicMonths.forEach(month => {
                // Si la mensualidad no ha sido pagada o está pendiente, la mostramos
                if (!paidOrPendingMonths.includes(month)) {
                    const option = document.createElement('option');
                    option.value = month;
                    option.textContent = month;
                    monthlyPaymentSelect.appendChild(option);
                }
            });

            // Si no hay mensualidades disponibles, mostrar un mensaje o deshabilitar el selector
            if (monthlyPaymentSelect.options.length === 1) { // Solo queda la opción por defecto
                const option = document.createElement('option');
                option.value = "";
                option.textContent = "No hay mensualidades pendientes de pago.";
                option.disabled = true;
                monthlyPaymentSelect.appendChild(option);
                monthlyPaymentSelect.disabled = true;
            } else {
                monthlyPaymentSelect.disabled = false;
            }

            paymentNotificationForm.style.display = 'none'; // Ocultar el formulario si no hay selección
            selectedMonthToPayInput.value = ''; // Limpiar el valor oculto
        };

        // Cargar las opciones de mensualidad al cargar la página
        loadMonthlyPaymentsOptions();

        // Evento para cuando se selecciona una mensualidad
        monthlyPaymentSelect.addEventListener('change', (event) => {
            const selectedMonth = event.target.value;
            if (selectedMonth) {
                paymentNotificationForm.style.display = 'block'; // Mostrar el formulario
                selectedMonthToPayInput.value = selectedMonth; // Guardar la mensualidad en el input oculto
                // Pre-llenar los datos del representante
                document.getElementById('payerName').value = loggedInUser.name;
                document.getElementById('payerLastName').value = loggedInUser.lastName;
                document.getElementById('payerPhone').value = loggedInUser.phone || '';
            } else {
                paymentNotificationForm.style.display = 'none'; // Ocultar si no hay selección
                selectedMonthToPayInput.value = '';
            }
        });

        // Lógica de envío del formulario de notificación de pago
        paymentNotificationForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const monthToPay = selectedMonthToPayInput.value; // Obtener la mensualidad del input oculto
            if (!monthToPay) {
                alert('Por favor, seleccione una mensualidad a cancelar.');
                return;
            }

            const paymentId = Date.now().toString();
            const payment = {
                id: paymentId,
                monthPaid: monthToPay, // ¡Nueva propiedad para la mensualidad!
                date: document.getElementById('paymentDate').value,
                bankOrigin: document.getElementById('bankOrigin').value,
                payerID: document.getElementById('payerID').value.trim(),
                payerPhone: document.getElementById('payerPhone').value.trim(),
                operationNumber: document.getElementById('operationNumber').value.trim(),
                payerName: document.getElementById('payerName').value,
                payerLastName: document.getElementById('payerLastName').value,
                status: document.getElementById('paymentStatus').value, // 'pendiente'
                notifiedBy: loggedInUser.username // Username del representante
            };

            let payments = JSON.parse(localStorage.getItem('payments')) || [];
            payments.push(payment);
            localStorage.setItem('payments', JSON.stringify(payments));

            alert(`Notificación de pago para "${monthToPay}" enviada con éxito. Estado: Pendiente.`);
            paymentNotificationForm.reset();
            loadMonthlyPaymentsOptions(); // Recargar las opciones para que la mensualidad desaparezca
        });
    }

    // --- Lógica para Ver Pagos (ver_pagos.html) ---
    const pendingPaymentsSelect = document.getElementById('pendingPaymentsSelect');
    const paymentReviewForm = document.getElementById('paymentReviewForm');
    const noPaymentsMessage = document.getElementById('noPaymentsMessage');
    const confirmPaymentButton = document.getElementById('confirmPaymentButton');
    const rejectPaymentButton = document.getElementById('rejectPaymentButton'); // Nuevo botón

    if (pendingPaymentsSelect && paymentReviewForm && noPaymentsMessage) {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

        if (!loggedInUser || loggedInUser.type !== 'director') {
            alert('Acceso no autorizado. Por favor, inicie sesión como director.');
            window.location.href = 'index.html';
            return;
        }

        const loadPendingPayments = () => {
            const payments = JSON.parse(localStorage.getItem('payments')) || [];
            // El director solo ve los pagos pendientes para revisar
            const pendingPayments = payments.filter(p => p.status === 'pendiente');

            pendingPaymentsSelect.innerHTML = '<option value="">-- Seleccione un Pago Pendiente --</option>';
            if (pendingPayments.length > 0) {
                noPaymentsMessage.style.display = 'none';
                pendingPayments.forEach(payment => {
                    const option = document.createElement('option');
                    option.value = payment.id;
                    // Mostrar la mensualidad en el selector del director
                    option.textContent = `${payment.payerName} ${payment.payerLastName} - ${payment.monthPaid} - Op: ${payment.operationNumber}`;
                    pendingPaymentsSelect.appendChild(option);
                });
            } else {
                noPaymentsMessage.style.display = 'block';
            }
            paymentReviewForm.style.display = 'none';
        };

        loadPendingPayments();

        pendingPaymentsSelect.addEventListener('change', (event) => {
            const selectedPaymentId = event.target.value;
            const payments = JSON.parse(localStorage.getItem('payments')) || [];
            const selectedPayment = payments.find(p => p.id === selectedPaymentId);

            if (selectedPayment) {
                document.getElementById('reviewPaymentId').value = selectedPayment.id;
                // Mostrar la mensualidad en los detalles
                document.getElementById('reviewMonthlyPayment').textContent = selectedPayment.monthPaid;
                document.getElementById('reviewPayerName').textContent = `${selectedPayment.payerName} ${selectedPayment.payerLastName}`;
                document.getElementById('reviewPaymentDate').textContent = selectedPayment.date;
                document.getElementById('reviewBankOrigin').textContent = selectedPayment.bankOrigin;
                document.getElementById('reviewPayerID').textContent = selectedPayment.payerID;
                document.getElementById('reviewPayerPhone').textContent = selectedPayment.payerPhone;
                document.getElementById('reviewOperationNumber').textContent = selectedPayment.operationNumber;
                document.getElementById('reviewPaymentStatus').textContent = selectedPayment.status;
                paymentReviewForm.style.display = 'block';
            } else {
                paymentReviewForm.style.display = 'none';
            }
        });

        // Lógica para confirmar o rechazar el pago
        const updatePaymentStatus = (status) => {
            const paymentIdToUpdate = document.getElementById('reviewPaymentId').value;
            if (!paymentIdToUpdate) {
                alert('No hay un pago seleccionado para actualizar.');
                return;
            }

            let payments = JSON.parse(localStorage.getItem('payments')) || [];
            const paymentIndex = payments.findIndex(p => p.id === paymentIdToUpdate);

            if (paymentIndex !== -1) {
                payments[paymentIndex].status = status;
                localStorage.setItem('payments', JSON.stringify(payments));
                alert(`Pago ${payments[paymentIndex].monthPaid} ${status} con éxito.`);
                loadPendingPayments(); // Recargar la lista de pagos pendientes
            } else {
                alert('Error: Pago no encontrado.');
            }
        };

        confirmPaymentButton.addEventListener('click', () => updatePaymentStatus('aprobado'));
        rejectPaymentButton.addEventListener('click', () => updatePaymentStatus('rechazado')); // Nuevo evento para rechazar

    }

    // --- Lógica para Inscribir Alumno (inscribir.html) ---
    const pendingStudentsSelect = document.getElementById('pendingStudentsSelect');
    const enrollmentForm = document.getElementById('enrollmentForm');
    const noPendingStudentsMessage = document.getElementById('noPendingStudentsMessage');

    if (pendingStudentsSelect && enrollmentForm && noPendingStudentsMessage) {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

        if (!loggedInUser || loggedInUser.type !== 'director') {
            alert('Acceso no autorizado. Por favor, inicie sesión como director.');
            window.location.href = 'index.html';
            return;
        }

        const enrollGradeLevelSelect = document.getElementById('enrollGradeLevel');
        const enrollGradeNumberSelect = document.getElementById('enrollGradeNumber');
        const enrollSectionSelect = document.getElementById('enrollSection');

        const populateEnrollSections = () => {
            enrollSectionSelect.innerHTML = '<option value="">Seleccione Sección</option>';
            const letters = ['A', 'B', 'C'];
            for (let i = 1; i <= 9; i++) {
                letters.forEach(letter => {
                    const option = document.createElement('option');
                    option.value = `${letter}-${i}`;
                    option.textContent = `${letter}-${i}`;
                    enrollSectionSelect.appendChild(option);
                });
            }
        };

        enrollGradeLevelSelect.addEventListener('change', () => {
            enrollGradeNumberSelect.innerHTML = '<option value="">Seleccione Grado</option>';
            const selectedLevel = enrollGradeLevelSelect.value;
            if (selectedLevel === 'primaria') {
                for (let i = 1; i <= 6; i++) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.textContent = i;
                    enrollGradeNumberSelect.appendChild(option);
                }
            } else if (selectedLevel === 'bachiller') {
                for (let i = 1; i <= 5; i++) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.textContent = i;
                    enrollGradeNumberSelect.appendChild(option);
                }
            }
            populateEnrollSections();
        });

        const loadPendingStudents = () => {
            const students = JSON.parse(localStorage.getItem('students')) || [];
            const pendingStudents = students.filter(s => s.status === 'pendiente');

            pendingStudentsSelect.innerHTML = '<option value="">-- Seleccione un Alumno Pendiente --</option>';
            if (pendingStudents.length > 0) {
                noPendingStudentsMessage.style.display = 'none';
                pendingStudents.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student.id;
                    option.textContent = `${student.name} ${student.lastName}`;
                    pendingStudentsSelect.appendChild(option);
                });
            } else {
                noPendingStudentsMessage.style.display = 'block';
            }
            enrollmentForm.style.display = 'none';
        };

        loadPendingStudents();

        pendingStudentsSelect.addEventListener('change', (event) => {
            const selectedStudentId = event.target.value;
            const students = JSON.parse(localStorage.getItem('students')) || [];
            const representatives = JSON.parse(localStorage.getItem('representatives')) || [];

            const selectedStudent = students.find(s => s.id === selectedStudentId);

            if (selectedStudent) {
                document.getElementById('enrollStudentId').value = selectedStudent.id;
                document.getElementById('studentNameDisplay').textContent = selectedStudent.name;
                document.getElementById('studentLastNameDisplay').textContent = selectedStudent.lastName;
                document.getElementById('studentIDDisplay').textContent = selectedStudent.idNumber || 'N/A';
                document.getElementById('studentAgeDisplay').textContent = selectedStudent.age;
                document.getElementById('studentGenderDisplay').textContent = selectedStudent.gender;

                const associatedRepresentative = representatives.find(rep => rep.name === selectedStudent.representante);
                if (associatedRepresentative) {
                    document.getElementById('repNameDisplay').textContent = associatedRepresentative.name;
                    document.getElementById('repLastNameDisplay').textContent = associatedRepresentative.lastName;
                    document.getElementById('repIDDisplay').textContent = associatedRepresentative.id;
                    document.getElementById('repEmailDisplay').textContent = associatedRepresentative.email;
                } else {
                    document.getElementById('repNameDisplay').textContent = 'No asociado';
                    document.getElementById('repLastNameDisplay').textContent = '';
                    document.getElementById('repIDDisplay').textContent = '';
                    document.getElementById('repEmailDisplay').textContent = '';
                }

                enrollGradeLevelSelect.value = '';
                enrollGradeNumberSelect.innerHTML = '<option value="">Seleccione Grado</option>';
                enrollSectionSelect.innerHTML = '<option value="">Seleccione Sección</option>';
                enrollmentForm.style.display = 'block';
            } else {
                enrollmentForm.style.display = 'none';
            }
        });

        enrollmentForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const studentIdToEnroll = document.getElementById('enrollStudentId').value;
            let students = JSON.parse(localStorage.getItem('students')) || [];
            const studentIndex = students.findIndex(s => s.id === studentIdToEnroll);

            if (studentIndex > -1) {
                if (students[studentIndex].status === 'pendiente') {
                    students[studentIndex].grade = enrollGradeNumberSelect.value;
                    students[studentIndex].section = enrollSectionSelect.value;
                    students[studentIndex].gradeLevel = enrollGradeLevelSelect.value;
                    students[studentIndex].status = 'inscrito';

                    localStorage.setItem('students', JSON.stringify(students));
                    alert('Alumno "' + students[studentIndex].name + ' ' + students[studentIndex].lastName + '" inscrito exitosamente.');
                    loadPendingStudents();
                    enrollmentForm.style.display = 'none';
                } else {
                    alert('Este alumno ya ha sido inscrito.');
                    loadPendingStudents();
                }
            } else {
                alert('Error: Alumno no encontrado.');
            }
        });
    }

    // --- Lógica para la vista Alumnos (alumnos.html) para Maestros ---
    const studentListForTeachers = document.getElementById('studentListForTeachers');
    if (studentListForTeachers) {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

        if (!loggedInUser || loggedInUser.type !== 'maestro') {
            alert('Acceso no autorizado. Por favor, inicie sesión como maestro.');
            window.location.href = 'index.html';
            return;
        }

        const loadTeacherStudents = () => {
            const allStudents = JSON.parse(localStorage.getItem('students')) || [];
            const teacherGradeLevel = loggedInUser.gradeLevel;
            const teacherGradeNumber = loggedInUser.gradeNumber;
            const teacherSection = loggedInUser.section;

            const relevantStudents = allStudents.filter(student =>
                student.status === 'inscrito' &&
                student.gradeLevel === teacherGradeLevel &&
                student.grade == teacherGradeNumber &&
                student.section === teacherSection
            );

            studentListForTeachers.innerHTML = '';

            if (relevantStudents.length > 0) {
                relevantStudents.forEach(student => {
                    const studentCard = document.createElement('div');
                    studentCard.className = 'student-card';
                    studentCard.innerHTML = `
                        <h3>${student.name} ${student.lastName}</h3>
                        <p><strong>Cédula:</strong> ${student.idNumber || 'N/A'}</p>
                        <p><strong>Edad:</strong> ${student.age}</p>
                        <p><strong>Género:</strong> ${student.gender}</p>
                        <p><strong>Grado:</strong> ${student.gradeLevel} ${student.grade}</p>
                        <p><strong>Sección:</strong> ${student.section}</p>
                        <p><strong>Representante:</strong> ${student.representante || 'N/A'}</p>
                    `;
                    studentListForTeachers.appendChild(studentCard);
                });
            } else {
                studentListForTeachers.innerHTML = '<p>No tienes alumnos inscritos asignados a tu grado y sección en este momento.</p>';
            }
        };

        loadTeacherStudents();
    }

    // --- Lógica para la vista Calificar Alumnos (calificaciones.html) ---
    const studentSelect = document.getElementById('studentSelect');
    const gradingArea = document.getElementById('gradingArea');
    const selectedStudentNameSpan = document.getElementById('selectedStudentName');
    const subjectNameDisplay = document.getElementById('subjectNameDisplay');
    const noStudentsMessage = document.getElementById('noStudentsMessage');

    if (studentSelect && gradingArea) {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

        if (!loggedInUser || loggedInUser.type !== 'maestro') {
            alert('Acceso no autorizado. Por favor, inicie sesión como maestro.');
            window.location.href = 'index.html';
            return;
        }

        subjectNameDisplay.textContent = loggedInUser.subject;

        const loadStudentsForGrading = () => {
            const allStudents = JSON.parse(localStorage.getItem('students')) || [];
            const teacherGradeLevel = loggedInUser.gradeLevel;
            const teacherGradeNumber = loggedInUser.gradeNumber;
            const teacherSection = loggedInUser.section;

            const relevantStudents = allStudents.filter(student =>
                student.status === 'inscrito' &&
                student.gradeLevel === teacherGradeLevel &&
                student.grade == teacherGradeNumber &&
                student.section === teacherSection
            );

            studentSelect.innerHTML = '<option value="">-- Seleccione un alumno --</option>';
            if (relevantStudents.length > 0) {
                noStudentsMessage.style.display = 'none';
                relevantStudents.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student.id;
                    option.textContent = `${student.name} ${student.lastName}`;
                    studentSelect.appendChild(option);
                });
            } else {
                noStudentsMessage.style.display = 'block';
            }
            gradingArea.style.display = 'none';
        };

        loadStudentsForGrading();

        studentSelect.addEventListener('change', (event) => {
            const studentId = event.target.value;
            if (studentId) {
                const students = JSON.parse(localStorage.getItem('students')) || [];
                const selectedStudent = students.find(s => s.id === studentId);

                if (selectedStudent) {
                    selectedStudentNameSpan.textContent = `${selectedStudent.name} ${selectedStudent.lastName}`;
                    gradingArea.style.display = 'block';
                    loadStudentGrades(selectedStudent, loggedInUser.subject);
                }
            } else {
                gradingArea.style.display = 'none';
            }
        });

        const generateGradeInputs = (containerId, numTests, currentGrades = []) => {
            const container = document.getElementById(containerId);
            container.innerHTML = '';

            const testTypes = ['Examen', 'Taller', 'Exposición', 'Proyecto'];

            for (let i = 0; i < numTests; i++) {
                const testDiv = document.createElement('div');
                testDiv.className = 'test-input-group';

                const typeSelect = document.createElement('select');
                typeSelect.className = 'test-type-select';
                typeSelect.required = true;

                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Tipo de Prueba';
                typeSelect.appendChild(defaultOption);

                testTypes.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type.toLowerCase();
                    option.textContent = type;
                    typeSelect.appendChild(option);
                });

                const gradeInput = document.createElement('input');
                gradeInput.type = 'number';
                gradeInput.className = 'test-grade-input';
                gradeInput.min = '1';
                gradeInput.max = '20';
                gradeInput.placeholder = 'Nota (1-20)';
                gradeInput.required = true;

                if (currentGrades[i]) {
                    typeSelect.value = currentGrades[i].type;
                    gradeInput.value = currentGrades[i].grade;
                    typeSelect.disabled = true;
                    gradeInput.readOnly = true;
                }

                testDiv.appendChild(typeSelect);
                testDiv.appendChild(gradeInput);
                container.appendChild(testDiv);
            }
        };

        document.querySelectorAll('.num-tests-select').forEach(select => {
            select.addEventListener('change', (event) => {
                const cut = event.target.id.replace('Tests', '');
                const containerId = `${cut}GradesContainer`;
                const numTests = parseInt(event.target.value);
                generateGradeInputs(containerId, numTests);
            });
        });

        const loadStudentGrades = (student, subject) => {
            const cuts = ['first', 'second', 'third'];
            cuts.forEach(cut => {
                const cutGrades = student.grades[subject]?.[cut]?.tests || [];
                const cutFinalGrade = student.grades[subject]?.[cut]?.finalGrade || '--';
                const cutStatus = student.grades[subject]?.[cut]?.status || '';

                const numTestsSelect = document.getElementById(`${cut}CutTests`);
                numTestsSelect.value = cutGrades.length.toString();
                generateGradeInputs(`${cut}CutGradesContainer`, cutGrades.length, cutGrades);

                document.getElementById(`${cut}CutFinalGrade`).textContent = `Promedio: ${cutFinalGrade}`;
                document.getElementById(`${cut}CutStatus`).textContent = `Estado: ${cutStatus}`;

                if (cutStatus === 'Calificado') {
                    document.getElementById(`${cut}CutTests`).disabled = true;
                    document.querySelector(`.grade-button[data-cut="${cut}"]`).disabled = true;
                    document.getElementById(`${cut}CutGradesContainer`).querySelectorAll('select, input').forEach(el => {
                        el.disabled = true;
                        el.readOnly = true;
                    });
                } else {
                    document.getElementById(`${cut}CutTests`).disabled = false;
                    document.querySelector(`.grade-button[data-cut="${cut}"]`).disabled = false;
                }
            });

            const finalSubjectGradeDisplay = document.getElementById('finalSubjectGrade');
            const studentSubjectGrades = student.grades[subject] || {};
            const firstCutFinal = studentSubjectGrades.first?.finalGrade;
            const secondCutFinal = studentSubjectGrades.second?.finalGrade;
            const thirdCutFinal = studentSubjectGrades.third?.finalGrade;

            if (firstCutFinal !== undefined && secondCutFinal !== undefined && thirdCutFinal !== undefined &&
                studentSubjectGrades.first.status === 'Calificado' &&
                studentSubjectGrades.second.status === 'Calificado' &&
                studentSubjectGrades.third.status === 'Calificado') {
                const overallFinalGrade = ((firstCutFinal + secondCutFinal + thirdCutFinal) / 3).toFixed(2);
                finalSubjectGradeDisplay.textContent = `Promedio Final: ${overallFinalGrade}`;
            } else {
                finalSubjectGradeDisplay.textContent = 'Promedio Final: --';
            }
        };

        document.querySelectorAll('.grade-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const cut = event.target.dataset.cut;
                const studentId = studentSelect.value;
                const loggedInSubject = loggedInUser.subject;

                if (!studentId) {
                    alert('Por favor, seleccione un alumno primero.');
                    return;
                }

                if (!confirm(`¿Está seguro de que desea calificar el ${cut} corte? Una vez calificado, no podrá modificarse.`)) {
                    return;
                }

                const gradesContainer = document.getElementById(`${cut}CutGradesContainer`);
                const testTypeSelects = gradesContainer.querySelectorAll('.test-type-select');
                const testGradeInputs = gradesContainer.querySelectorAll('.test-grade-input');

                if (testTypeSelects.length === 0) {
                    alert('Debe especificar la cantidad de pruebas para calificar este corte.');
                    return;
                }

                let totalGrades = 0;
                const testGrades = [];
                let allGradesValid = true;

                testGradeInputs.forEach((input, index) => {
                    const grade = parseFloat(input.value);
                    const type = testTypeSelects[index].value;

                    if (isNaN(grade) || grade < 1 || grade > 20 || type === '') {
                        alert(`Por favor, ingrese un tipo de prueba y una nota válida (1-20) para la prueba ${index + 1} del ${cut} corte.`);
                        allGradesValid = false;
                        return;
                    }
                    totalGrades += grade;
                    testGrades.push({ type: type, grade: grade });
                });

                if (!allGradesValid) {
                    return;
                }

                const finalCutGrade = (totalGrades / testGrades.length).toFixed(2);

                let students = JSON.parse(localStorage.getItem('students')) || [];
                const studentIndex = students.findIndex(s => s.id === studentId);

                if (studentIndex > -1) {
                    if (!students[studentIndex].grades[loggedInSubject]) {
                        students[studentIndex].grades[loggedInSubject] = {};
                    }

                    students[studentIndex].grades[loggedInSubject][cut] = {
                        tests: testGrades,
                        finalGrade: parseFloat(finalCutGrade),
                        status: 'Calificado',
                        dateGraded: new Date().toISOString()
                    };

                    localStorage.setItem('students', JSON.stringify(students));
                    alert(`El ${cut} corte ha sido calificado con éxito. Promedio: ${finalCutGrade}`);

                    document.getElementById(`${cut}CutFinalGrade`).textContent = `Promedio: ${finalCutGrade}`;
                    document.getElementById(`${cut}CutStatus`).textContent = `Estado: Calificado`;
                    document.getElementById(`${cut}CutTests`).disabled = true;
                    event.target.disabled = true;
                    gradesContainer.querySelectorAll('select, input').forEach(el => {
                        el.disabled = true;
                        el.readOnly = true;
                    });

                    const currentStudent = students[studentIndex];
                    const studentSubjectGrades = currentStudent.grades[loggedInSubject] || {};
                    const firstCutFinal = studentSubjectGrades.first?.finalGrade;
                    const secondCutFinal = studentSubjectGrades.second?.finalGrade;
                    const thirdCutFinal = studentSubjectGrades.third?.finalGrade;

                    if (firstCutFinal !== undefined && secondCutFinal !== undefined && thirdCutFinal !== undefined &&
                        studentSubjectGrades.first.status === 'Calificado' &&
                        studentSubjectGrades.second.status === 'Calificado' &&
                        studentSubjectGrades.third.status === 'Calificado') {
                        const overallFinalGrade = ((firstCutFinal + secondCutFinal + thirdCutFinal) / 3).toFixed(2);
                        document.getElementById('finalSubjectGrade').textContent = `Promedio Final: ${overallFinalGrade}`;
                    }

                } else {
                    alert('Error: Alumno no encontrado.');
                }
            });
        });
    }

    // --- Lógica para la vista Ver Notas (notas.html) para Representantes ---
    const gradesDisplayArea = document.getElementById('gradesDisplayArea');
    const noStudentsMessageForGrades = document.getElementById('noStudentsMessage'); // Renombrado para evitar conflicto

    if (gradesDisplayArea) { // Asegurarse de que estamos en notas.html
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

        if (!loggedInUser || loggedInUser.type !== 'representante') {
            alert('Acceso no autorizado. Por favor, inicie sesión como representante.');
            window.location.href = 'index.html';
            return;
        }

        const loadStudentGradesForRepresentative = () => {
            const allStudents = JSON.parse(localStorage.getItem('students')) || [];
            const associatedStudents = allStudents.filter(student =>
                loggedInUser.alumno_r && loggedInUser.alumno_r.includes(student.name) && student.status === 'inscrito'
            );

            gradesDisplayArea.innerHTML = ''; // Limpiar el área antes de cargar

            if (associatedStudents.length === 0) {
                noStudentsMessageForGrades.style.display = 'block';
                return;
            } else {
                noStudentsMessageForGrades.style.display = 'none';
            }

            associatedStudents.forEach(student => {
                const studentGradesContainer = document.createElement('div');
                studentGradesContainer.className = 'student-grades-container';

                studentGradesContainer.innerHTML = `
                    <h2>Notas de ${student.name} ${student.lastName}</h2>
                    <table class="grades-table">
                        <thead>
                            <tr>
                                <th>Materia</th>
                                <th>1er Corte</th>
                                <th>2do Corte</th>
                                <th>3er Corte</th>
                                <th>Nota Final</th>
                            </tr>
                        </thead>
                        <tbody id="gradesTableBody-${student.id}">
                            </tbody>
                    </table>
                    <button class="print-button" data-student-id="${student.id}">Imprimir Notas</button>
                `;
                gradesDisplayArea.appendChild(studentGradesContainer);

                const gradesTableBody = document.getElementById(`gradesTableBody-${student.id}`);
                const studentSubjectGrades = student.grades || {}; // Todas las materias del alumno

                let hasAnyGrades = false;

                // Recorrer cada materia para la que el alumno tenga notas
                for (const subject in studentSubjectGrades) {
                    if (studentSubjectGrades.hasOwnProperty(subject)) {
                        hasAnyGrades = true;
                        const subjectData = studentSubjectGrades[subject];

                        const firstCutGrade = subjectData.first?.finalGrade !== undefined ? subjectData.first.finalGrade.toFixed(2) : '--';
                        const secondCutGrade = subjectData.second?.finalGrade !== undefined ? subjectData.second.finalGrade.toFixed(2) : '--';
                        const thirdCutGrade = subjectData.third?.finalGrade !== undefined ? subjectData.third.finalGrade.toFixed(2) : '--';

                        let finalSubjectGrade = '--';
                        if (subjectData.first?.status === 'Calificado' &&
                            subjectData.second?.status === 'Calificado' &&
                            subjectData.third?.status === 'Calificado') {
                            const avg = (subjectData.first.finalGrade + subjectData.second.finalGrade + subjectData.third.finalGrade) / 3;
                            finalSubjectGrade = avg.toFixed(2);
                        }

                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${subject}</td>
                            <td>${firstCutGrade}</td>
                            <td>${secondCutGrade}</td>
                            <td>${thirdCutGrade}</td>
                            <td>${finalSubjectGrade}</td>
                        `;
                        gradesTableBody.appendChild(row);
                    }
                }

                if (!hasAnyGrades) {
                    // Si el alumno no tiene ninguna nota calificada en ninguna materia
                    const noGradesRow = document.createElement('tr');
                    noGradesRow.innerHTML = `<td colspan="5" style="text-align: center; color: #888;">No hay notas registradas para este alumno aún.</td>`;
                    gradesTableBody.appendChild(noGradesRow);
                }
            });

            // Añadir event listeners a los botones de impresión
            document.querySelectorAll('.print-button').forEach(button => {
                button.addEventListener('click', (event) => {
                    const studentId = event.target.dataset.studentId;
                    const studentToPrint = associatedStudents.find(s => s.id === studentId);

                    if (studentToPrint) {
                        const tableHTML = event.target.previousElementSibling.outerHTML; // Obtener el HTML de la tabla

                        // Guardar los datos en localStorage para que imprimir.html pueda acceder a ellos
                        localStorage.setItem('printGradesData', JSON.stringify({
                            studentName: studentToPrint.name,
                            studentLastName: studentToPrint.lastName,
                            studentID: studentToPrint.idNumber || 'N/A',
                            tableHTML: tableHTML
                        }));

                        // Redirigir a la página de impresión
                        window.open('imprimir.html', '_blank'); // Abre en una nueva pestaña
                    } else {
                        alert('Error: No se encontró al alumno para imprimir las notas.');
                    }
                });
            });
        };

        loadStudentGradesForRepresentative();
    }
});