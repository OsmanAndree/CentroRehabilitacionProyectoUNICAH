exports.IniciarSesion = async (req, res) => {
    const errores = validationResult(req);
    const ers = [];

    errores.errors.forEach(e => {
        ers.push({ campo: e.path, msj: e.msg });
    });

    if (ers.length > 0) {
        return res.status(200).json({ ers });
    }

    try {
        const { login, contrasena } = req.body;

        const usuario = await modeloUsuario.findOne({
            where: {
                [Op.or]: {
                    correo: login,
                    nombreUsuario: login
                },
                estado: 'AC'
            }
        });

        if (!usuario) {
            return res.status(400).json({ msg: "Usuario o contraseña incorrectos" });
        }

        if (await argon2.verify(usuario.contrasena, contrasena)) {
            usuario.intentos = 0;
            await usuario.save();

            const token = getToken({ id: usuario.id });
            return res.status(200).json({ usuario , token });
        } else {
            usuario.intentos += 1;
            if (usuario.intentos === 5) {
                usuario.estado = 'BL';
            }
            await usuario.save();

            return res.json({ error: "Usuario o contraseña incorrectos" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Error en el servidor" });
    }
};