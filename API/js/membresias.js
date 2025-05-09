import apiClient from '../apiClient.js';
import loginService from '../services/login.js';
import membresiaUsuarioService from '../services/membresiaUsuario.js';
import membersService from '../services/members.js';

const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', async () => {
    if (!loginService.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    const userData = loginService.getUserData();
    if (!userData?.userId) {
        console.error('No se pudo obtener el ID del usuario');
        return;
    }

    try {
        const response = await membresiaUsuarioService.getByUserId(userData.userId);
        
        if (response.success && response.data) {
            console.log('Datos de membresías a renderizar:', response.data);
            renderMembresias(response.data);
        } else {
            console.error('Error al obtener membresías:', response.message);
            renderMembresias([]);
        }
    } catch (error) {
        console.error('Error:', error);
        renderMembresias([]);
    }
});

function renderMembresias(membresiasData) {
    const tbody = document.querySelector('.membership-table tbody');
    tbody.innerHTML = '';

    if (!membresiasData?.length) {
        tbody.innerHTML = '<tr><td colspan="6">No tienes membresías registradas</td></tr>';
        return;
    }

    membresiasData.forEach((membresia, index) => {
        const row = document.createElement('tr');
        const estado = membresia.estado?.toString()?.toLowerCase()?.trim();
        const esActiva = estado === 'activa' || estado === 'activo'; 
        
        row.innerHTML = `
            <td>${membresia.id || 'N/A'}</td>
            <td>${formatDate(membresia.fecha_inicio)}</td>
            <td>${formatDate(membresia.fecha_fin)}</td>
            <td>${membresia.membresia_nombre || 'N/A'}</td>
            <td><span class="${getEstadoClass(estado)}">${membresia.estado || 'N/A'}</span></td>
            <td class="action-cell"></td>
        `;

        const actionCell = row.querySelector('.action-cell');
        if (esActiva) {  
            const downloadBtn = document.createElement('button');
            const downloadIcon = document.createElement('i');
            downloadIcon.className = "fa-solid fa-download";
            downloadBtn.className = 'download-btn';

            downloadBtn.textContent = 'Descargar';
            downloadBtn.addEventListener('click', () => generateMembershipPDF(membresia));
            downloadBtn.appendChild(downloadIcon);
            actionCell.appendChild(downloadBtn);
        } else {
            actionCell.textContent = 'No disponible';
        }

        tbody.appendChild(row);
    });
}

async function generateMembershipPDF(membresia) {
    try {
        // Obtener datos del usuario
        const userData = loginService.getUserData();
        const userId = userData?.userId;
        
        if (!userId) {
            throw new Error('No se pudo obtener el ID del usuario');
        }

        // Obtener información completa del miembro
        const memberResponse = await membersService.getbyID(userId);
        if (!memberResponse || (!memberResponse.nombre && !memberResponse.apellidos)) {
            throw new Error('No se pudo obtener la información del perfil');
        }

        // Crear documento PDF
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Configuración general
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let yPosition = 20;
        
        // Establecer fuente
        doc.setFont('helvetica');
        
        // Header Section
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        try {
            const logoData = await loadImageToDataURL('./img/logo_REDMIS.png');
            if (logoData) {
                doc.addImage(logoData, 'PNG', margin, yPosition, 50, 30);
            }
        } catch (e) {
            console.log('No se pudo cargar el logo:', e);
        }
        
        // Título al lado del logo
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('Red Mexicana de Ingeniería de Software', margin + 55, yPosition + 15);
        
        yPosition += 40;
        
        // Content Section
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Gracias', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text('Por adquirir su membresía', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 7;
        doc.text('Desde ahora Usted forma parte del nodo:', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;
        
        // Universidad
        doc.setFont(undefined, 'bold');
        doc.text(memberResponse.universidad || 'Universidad no especificada', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 15;
        
        // Lista de universidades
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Nodos pertenecientes a la red:', margin, yPosition);
        yPosition += 7;
        
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        
        const universities1 = [
            'Universidad Autónoma de Baja California',
            'Universidad Nacional Autónoma de México',
            'Universidad Autónoma de San Luis Potosí',
            'Universidad Autónoma de Yucatán',
            'Universidad Autónoma de Zacatecas',
            'Universidad Tecnológica de la Mixteca',
            'Universidad Popular Autónoma del Estado de Puebla',
            'Universidad Veracruzana',
            'Universidad Autónoma de Sinaloa',
            'Universidad Autónoma Metropolitana'
        ];
        
        const universities2 = [
            'Universidad Autónoma de Ciudad Juárez',
            'Instituto Tecnológico de Hermosillo',
            'Centro Nacional de Investigación y Desarrollo Tecnológico',
            'Instituto Tecnológico y de Estudios Superiores de Monterrey',
            'CINVESTAV, Tamaulipas',
            'Universidad Politécnica de Tapachula',
            'Instituto Tecnológico de Sonora',
            'Instituto Tecnológico de Tijuana',
            'Instituto Tecnológico de León'
        ];
        
        // Primera columna
        let uniY = yPosition;
        universities1.forEach(uni => {
            doc.text('• ' + uni, margin, uniY);
            uniY += 5;
        });
        
        // Segunda columna
        uniY = yPosition;
        universities2.forEach(uni => {
            doc.text('• ' + uni, margin + 100, uniY);
            uniY += 5;
        });
        
        // Ajustamos la posición Y para dejar espacio después de la lista
        yPosition += Math.max(universities1.length, universities2.length) * 5 + 20;
        
        // Mensaje credencial (ahora aparece después de la lista de universidades)
        doc.setFont(undefined, 'normal');
        doc.text('En seguida se muestra la versión digital de su credencial de', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 7;
        doc.text('membresía para un acceso más rápido de la información.', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 25; // Aumentamos este espacio para bajar las tarjetas
        
        // Cards Section (ahora aparece más abajo)
        const cardWidth = 80;
        const cardHeight = 50;
        const cardMargin = (pageWidth - (cardWidth * 2)) / 3;
        
        // Función reusable para crear cards con gradiente
        const createGradientCard = (doc, x, y, width, height) => {
            try {
                const scale = 3;
                const canvas = document.createElement('canvas');
                canvas.width = width * scale;
                canvas.height = height * scale;
                const ctx = canvas.getContext('2d');
                ctx.scale(scale, scale);
                
                // Gradiente profesional
                const gradient = ctx.createLinearGradient(0, 0, width, 0);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.51)');
                gradient.addColorStop(0.4271, 'rgba(178, 132, 5, 0.2)');
                gradient.addColorStop(0.6823, 'rgba(178, 132, 5, 0.29)');
                gradient.addColorStop(0.775, 'rgba(239, 184, 16, 0.44)');
                
                // Bordes redondeados
                const cornerRadius = 5;
                ctx.beginPath();
                ctx.moveTo(cornerRadius, 0);
                ctx.lineTo(width - cornerRadius, 0);
                ctx.quadraticCurveTo(width, 0, width, cornerRadius);
                ctx.lineTo(width, height - cornerRadius);
                ctx.quadraticCurveTo(width, height, width - cornerRadius, height);
                ctx.lineTo(cornerRadius, height);
                ctx.quadraticCurveTo(0, height, 0, height - cornerRadius);
                ctx.lineTo(0, cornerRadius);
                ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
                ctx.closePath();
                
                ctx.fillStyle = gradient;
                ctx.fill();
                ctx.strokeStyle = 'rgba(178, 132, 5, 0.8)';
                ctx.lineWidth = 0.8;
                ctx.stroke();
                
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                return canvas.toDataURL('image/png', 1.0);
            } catch (e) {
                console.error('Error al crear gradiente:', e);
                return null;
            }
        };
        
        // Front Card
        const frontGradient = createGradientCard(doc, cardMargin, yPosition, cardWidth, cardHeight);
        if (frontGradient) {
            doc.addImage(frontGradient, 'PNG', cardMargin, yPosition, cardWidth, cardHeight, undefined, 'FAST');
        } else {
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(178, 132, 5);
            doc.setLineWidth(0.5);
            doc.roundedRect(cardMargin, yPosition, cardWidth, cardHeight, 5, 5, 'FD');
        }
        
        // Contenido Front Card (antes del logo para mejor layering)
doc.setTextColor(40, 40, 40);
doc.setFontSize(15);
doc.setFont(undefined, 'bold');
doc.text(membresia.membresia_nombre || 'ORO', cardMargin + cardWidth - 22, yPosition + 10);

doc.setFontSize(8);
doc.setFont(undefined, 'normal');
doc.text(`Socio: ${(memberResponse.nombre + ' ' + memberResponse.apellidos) || 'Nombre no disponible'}`, cardMargin + 5, yPosition + 20);
doc.text(`No.: ${membresia.id || 'N/A'}`, cardMargin + 5, yPosition + 25);
doc.text(`IES: ${memberResponse.universidad || 'No especificada'}`, cardMargin + 5, yPosition + 30);
doc.text(`País: ${memberResponse.pais || 'No especificado'}`, cardMargin + 5, yPosition + 35);

// Texto MEMBRESÍA (movido a la izquierda para balance)
doc.setFontSize(15);
doc.setFont(undefined, 'bold');
doc.text('MEMBRESÍA', cardMargin + 5, yPosition + cardHeight - 5);

// Agregar logo en la parte inferior derecha
//try {
//    const logoData = await loadImageToDataURL('./img/logo_REDMIS.png');
//    if (logoData) {
//        const logoWidth = 25;  // Ancho del logo en mm
//        const logoHeight = 15; // Alto del logo en mm
//        const logoRightMargin = 3; // Margen derecho en mm
//        const logoBottomMargin = 5; // Margen inferior en mm
        
//        doc.addImage(logoData, 'PNG', 
//            cardMargin + cardWidth - logoWidth - logoRightMargin, // Posición X (derecha)
//            yPosition + cardHeight - logoHeight - logoBottomMargin, // Posición Y (abajo)
//            logoWidth, 
//            logoHeight
//        );
//    }
//} catch (e) {
//    console.log('No se pudo cargar el logo:', e);
//}

        // Back Card (mismo gradiente)
        const backGradient = createGradientCard(doc, cardMargin * 2 + cardWidth, yPosition, cardWidth, cardHeight);
        if (backGradient) {
            doc.addImage(backGradient, 'PNG', cardMargin * 2 + cardWidth, yPosition, cardWidth, cardHeight, undefined, 'FAST');
        } else {
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(178, 132, 5);
            doc.setLineWidth(0.5);
            doc.roundedRect(cardMargin * 2 + cardWidth, yPosition, cardWidth, cardHeight, 5, 5, 'FD');
        }
        
        // Contenido Back Card (optimizado para legibilidad sobre gradiente)
        const backCardX = cardMargin * 2 + cardWidth;
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(50, 50, 50); // Gris oscuro para mejor contraste
        doc.text('Red Mexicana de Ingeniería de Software', backCardX + 5, yPosition + 10);
        
        doc.setFontSize(6);
        doc.setFont(undefined, 'normal');
        const textLines1 = doc.splitTextToSize(
            'Esta membresía le identifica como miembro de la REDMIS, conformada por profesores, investigadores y profesionistas relacionados con la Ingeniería de Software.',
            cardWidth - 12
        );
        doc.text(textLines1, backCardX + 6, yPosition + 16);
        
        const textLines2 = doc.splitTextToSize(
            'Puede participar en actividades, eventos, proyectos de investigación e iniciativas educativas de la red.',
            cardWidth - 12
        );
        doc.text(textLines2, backCardX + 6, yPosition + 30);
        
        // Footer con estilo consistente
        doc.setFontSize(7);
        doc.setTextColor(178, 132, 5); // Dorado para destacar
        doc.text('conisoft.org/redmis', backCardX + cardWidth / 2, yPosition + cardHeight - 7, { align: 'center' });
        // Guardar el PDF
        const nombreArchivo = `Membresía_${memberResponse.nombre_completo || memberResponse.nombre || 'usuario'}.pdf`;
        doc.save(nombreArchivo);
        
    } catch (error) {
        console.error('Error generando PDF:', error);
        alert('Error al generar el certificado: ' + error.message);
    }
}

// Función auxiliar para cargar imágenes (necesaria para el logo)
function loadImageToDataURL(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            // Rellenar con blanco primero si quieres fondo blanco
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png')); // Usar PNG
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });
}
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return isNaN(date) ? dateString : date.toLocaleDateString('es-ES');
    } catch {
        return dateString;
    }
}

function getEstadoClass(estado) {
    const classMap = {
        'activa': 'aceptada', 
        'activo': 'aceptada',  
        'inactivo': 'rechazada', 
        'inactiva': 'rechazada', 
        'pendiente': 'pendiente',
        'vencido': 'rechazada',
        'vencida': 'rechazada' 
    };
    return classMap[estado] || '';
}
