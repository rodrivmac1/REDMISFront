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
            downloadBtn.className = 'download-btn';
            downloadBtn.textContent = 'Descargar';
            downloadBtn.addEventListener('click', () => generateMembershipPDF(membresia));
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
        if (!memberResponse || !memberResponse.nombre_completo) {
            throw new Error('No se pudo obtener la información del perfil');
        }

        // Crear documento PDF
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        
        // Título
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text('CERTIFICADO DE MEMBRESÍA', pageWidth / 2, 30, { align: 'center' });
        
        // Línea decorativa
        doc.setDrawColor(0, 100, 180);
        doc.setLineWidth(0.8);
        doc.line(margin, 40, pageWidth - margin, 40);
        
        // Información del miembro
        doc.setFontSize(12);
        let yPosition = 60;
        
        // Nombre del miembro (obtenido del servicio de miembros)
        doc.setFont(undefined, 'bold');
        doc.text('Miembro:', margin, yPosition);
        doc.setFont(undefined, 'normal');
        doc.text(memberResponse.nombre_completo || memberResponse.nombre || 'Nombre no disponible', margin + 20, yPosition);
        yPosition += 10;
        
        // Separador
        yPosition += 5;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
        
        // Detalles de la membresía
        doc.setFont(undefined, 'bold');
        doc.text('Detalles de la Membresía:', margin, yPosition);
        doc.setFont(undefined, 'normal');
        yPosition += 10;
        
        // Formatear fechas
        const fechaInicio = formatDate(membresia.fecha_inicio);
        const fechaFin = formatDate(membresia.fecha_fin);
        
        // Datos de la membresía
        doc.text(`• Código: ${membresia.id || 'N/A'}`, margin, yPosition);
        yPosition += 8;
        doc.text(`• Tipo: ${membresia.membresia_nombre || 'N/A'}`, margin, yPosition);
        yPosition += 8;
        doc.text(`• Fecha de inicio: ${fechaInicio}`, margin, yPosition);
        yPosition += 8;
        doc.text(`• Fecha de vencimiento: ${fechaFin}`, margin, yPosition);
        yPosition += 8;
        doc.text(`• Estado: ${membresia.estado || 'N/A'}`, margin, yPosition);
        yPosition += 20;
        
        // Mensaje de validez
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Este documento certifica que el titular posee una membresía válida', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 6;
        doc.text('en nuestro sistema durante el período indicado.', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 20;
        
        // Fecha de emisión
        const today = new Date();
        doc.text(`Emitido el: ${today.toLocaleDateString('es-ES')}`, margin, yPosition);
        yPosition += 15;
        
        // Firma (opcional)
        doc.setFontSize(10);
        doc.text('_________________________', pageWidth - margin - 50, yPosition);
        yPosition += 5;
        doc.text('Firma autorizada', pageWidth - margin - 50, yPosition);
        
        // Guardar el PDF
        const nombreArchivo = `Membresía_${memberResponse.nombre_completo || memberResponse.nombre || 'usuario'}_${membresia.id || ''}.pdf`;
        doc.save(nombreArchivo);
        
    } catch (error) {
        console.error('Error generando PDF:', error);
        alert('Error al generar el certificado: ' + error.message);
    }
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
