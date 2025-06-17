const asyncHandler = (fn) => {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        return res.status(500).json({
          message: "500 Internal Server Error",
          error,
        });
      }
    };
  };
  
  export default asyncHandler;
  