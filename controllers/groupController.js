const Group = require('../models/Group');


exports.createGroup = async (req, res) => {
    try {
        const { name, adminId } = req.body;
        const newGroup = new Group({
            name,
            admin: adminId,
            members: [adminId] 
        });
        await newGroup.save();
        res.status(201).json(newGroup);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.addMember = async (req, res) => {
    try {
        const { groupId, adminId, newMemberId } = req.body;
        const group = await Group.findById(groupId);

        if (group.admin.toString() !== adminId) {
            return res.status(403).json({ msg: 'No tienes permisos de administrador' });
        }

        await Group.findByIdAndUpdate(groupId, { $addToSet: { members: newMemberId } });
        res.json({ msg: 'Miembro agregado con éxito al grupo' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ELIMINAR/ECHAR INTEGRANTE
exports.kickMember = async (req, res) => {
    try {
        const { groupId, adminId, targetMemberId } = req.body;
        const group = await Group.findById(groupId);

        if (group.admin.toString() !== adminId) {
            return res.status(403).json({ msg: 'No tienes permisos de administrador' });
        }

        await Group.findByIdAndUpdate(groupId, { $pull: { members: targetMemberId } });
        res.json({ msg: 'Miembro removido del grupo' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
