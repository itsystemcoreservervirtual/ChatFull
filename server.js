const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');

const app = express();
app.use(express.json());
app.use(express.static('public'));


mongoose.connect('mongodb://localhost:27017/chatfull')
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error de conexión:', err));

// ==========================================
// 1. RUTA DE REGISTRO (EVITA DUPLICADOS)
// ==========================================
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validación manual preventiva antes de guardar
        const existe = await User.findOne({ username: username.toLowerCase() });
        if (existe) {
            return res.status(400).json({ mensaje: 'Este nombre de usuario ya está registrado.' });
        }

        const nuevoUsuario = new User({ 
            username: username.toLowerCase(), 
            password 
        });
        
        await nuevoUsuario.save();
        return res.status(201).json({ mensaje: '¡Usuario creado con éxito!' });

    } catch (error) {
       
        if (error.code === 11000) {
            return res.status(400).json({ mensaje: 'El usuario ya existe (Error de duplicado).' });
        }
        console.error(error);
        return res.status(500).json({ mensaje: 'Error interno al registrar.' });
    }
});

// ==========================================
// 2. RUTA DE LOGIN (BLOQUEA SI NO EXISTE)
// ==========================================
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        
        const usuario = await User.findOne({ username: username.toLowerCase() });

        // SI NO EXISTE EL REGISTRO: Bloqueamos el inicio de sesión de inmediato
        if (!usuario) {
            return res.status(401).json({ mensaje: 'Acceso denegado. El usuario no se encuentra registrado.' });
        }

      
        if (usuario.password !== password) {
            return res.status(401).json({ mensaje: 'Contraseña incorrecta.' });
        }

       
        return res.status(200).json({ mensaje: '¡Credenciales correctas! Entrando...' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error interno al iniciar sesión.' });
    }
});

app.listen(3000, () => console.log('Servidor activo en el puerto 3000'));
