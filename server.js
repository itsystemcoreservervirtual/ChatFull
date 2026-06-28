const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    maxHttpBufferSize: 1e8 
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/api/chats', async (req, res) => {
    try {
        const Chat = require('./models/Chat'); 
        const chats = await Chat.find();     
        res.json(chats);
    } catch (err) {
        res.status(500).json({ error: "Error al cargar" });
    }
});
// --- PUENTE PARA CARGAR CHATS ---
app.get('/api/chats', async (req, res) => {
    try {
        const Chat = require('./models/Chat'); 
        const chats = await Chat.find();      
        res.json(chats);                      
    } catch (err) {
        console.error("Error al cargar chats:", err);
        res.status(500).json({ error: "Error en el servidor" });
    }
});
io.on('connection', (socket) => {
    console.log('Usuario conectado al ecosistema de chat');

  
    socket.on('user-online', (userId) => {
        socket.userId = userId;
        socket.join(userId); 
    });

    
    socket.on('private-message', ({ to, text, image }) => {
        io.to(to).to(socket.userId).emit('new-message', {
            sender: socket.userId,
            text,
            image,
            timestamp: new Date()
        });
    });

    socket.on('block-user', ({ targetUserId }) => {
        socket.emit('user-blocked-success', { targetUserId });
    });

    socket.on('delete-message', ({ messageId, mode }) => {
        if (mode === 'everyone') {
        
            io.emit('message-deleted-everyone', { messageId });
        } else {
         
            socket.emit('message-deleted-me', { messageId });
        }
    });

  
    socket.on('join-group', (groupId) => {
        socket.join(groupId);
    });

    socket.on('group-message', ({ groupId, text, image }) => {
        io.to(groupId).emit('new-group-message', {
            groupId,
            sender: socket.userId,
            text,
            image,
            timestamp: new Date()
        });
    });

    socket.on('add-member', ({ groupId, newMemberId }) => {
     
        io.to(groupId).emit('member-added', { groupId, newMemberId });
    });

    socket.on('kick-member', ({ groupId, targetMemberId }) => {
        
        io.to(groupId).emit('member-kicked', { groupId, targetMemberId });
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});


const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://TU_USUARIO:TU_CONTRASEÑA@cluster0.xxxxx.mongodb.net/nombre_de_tu_bd";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas en la nube'))
  .catch(err => console.error('❌ Error de conexión a la base de datos:', err));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor Profesional corriendo en el puerto ${PORT}`));
