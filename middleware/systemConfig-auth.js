module.exports = (req, res, next) => {
    if (req.user.role === 'admin') {
      next();
      return;
    }
    console.log('you dont have permission');
      return res.redirect('/');
    
  };