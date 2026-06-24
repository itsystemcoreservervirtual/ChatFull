const Message = require('../models/Message');
const User = require('../models/User');

// BLOQUEAR USUARIO
exports.blockUser = async (req, res) => {
    try {
        const { myUserId, targetUserId } = req.body;
        await User.findByIdAndUpdate(myUserId, { $addToSet: { blockedUsers: targetUserId } });
        res.json({ msg: 'Usuario bloqueado con éxito' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DESBLOQUEAR USUARIO
exports.unblockUser = async (req, res) => {
    try {
        const { myUserId, targetUserId } = req.body;
        await User.findByIdAndUpdate(myUserId, { $pull: { blockedUsers: targetUserId } });
        res.json({ msg: 'Usuario desbloqueado con éxito' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ELIMINAR MENSAJE SELECTIVO
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId, userId, mode } = req.body; // mode puede ser 'for_me' o 'everyone'

        if (mode === 'everyone') {
            // Borrado para todos: Cambia el estado del mensaje
            await Message.findByIdAndUpdate(messageId, { isDeletedEveryone: true, text: 'Este mensaje fue eliminado' });
        } else {
            // Borrado para mí: Oculta el mensaje agregando el usuario a la lista oculta
            await Message.findByIdAndUpdate(messageId, { $addToSet: { hiddenFor: userId } });
        }
        res.json({ msg: 'Proceso de borrado completado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};