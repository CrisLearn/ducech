import transporter from '../config/nodemailer.js';

export const sendEmail = async (req, res) => {
  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ error: 'Faltan datos necesarios (to, subject, text)' });
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      text,
    });

    res.status(200).json({ message: 'Correo enviado exitosamente', info });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ error: 'No se pudo enviar el correo', details: error.message });
  }
};
