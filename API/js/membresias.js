import apiClient from '../apiClient.js';
import loginService from '../services/login.js';
import membresiaUsuarioService from '../services/membresiaUsuario.js';

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

function generateMembershipPDF(membresia) {  
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        
        // Encabezado
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text('CERTIFICADO DE MEMBRESÍA', pageWidth / 2, 30, { align: 'center' });
        
        // Contenido
        doc.setFontSize(12);
        let y = 50;
        
        doc.text(`Código: ${membresia.id || 'N/A'}`, margin, y);
        y += 10;
        doc.text(`Tipo: ${membresia.membresia_nombre || 'N/A'}`, margin, y);
        y += 10;
        doc.text(`Fecha inicio: ${formatDate(membresia.fecha_inicio)}`, margin, y);
        y += 10;
        doc.text(`Fecha fin: ${formatDate(membresia.fecha_fin)}`, margin, y);
        y += 20;
        
        doc.save(`membresia_${membresia.id || new Date().getTime()}.pdf`);
    } catch (error) {
        console.error('Error generando PDF:', error);
        alert('Error al generar el PDF');
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
