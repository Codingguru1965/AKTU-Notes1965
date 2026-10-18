export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const data = source === 'query' ? req.query : source === 'params' ? req.params : req.body;
      const parsed = schema.parse(data);
      if (source === 'query') {
        req.query = parsed;
      } else if (source === 'params') {
        req.params = parsed;
      } else {
        req.body = parsed;
      }
      next();
    } catch (err) {
      if (err.errors) {
        const errorMap = {};
        err.errors.forEach(e => {
          const key = e.path.join('.') || 'root';
          errorMap[key] = e.message;
        });
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errorMap
        });
      }
      next(err);
    }
  };
};
