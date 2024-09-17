
// Middleware to check if the request body is an array and enforce a length limit
function validateArrayBody(maxLength) {
  return (req, res, next) => {
    const body = req.body;
    // Check if hash_list is present in the request body
    if (!body.hasOwnProperty('hash_list')) {
      return res.status(400).json({ error: 'Request body must contain hash_list as an array.' });
    }

    // Check if hash_list is an array
    if (!Array.isArray(body['hash_list'])) {
      return res.status(400).json({ error: 'hash_list must be an array.' });
    }

    // Check if array length exceeds the limit
    if (body['hash_list'].length > maxLength) {
      return res.status(400).json({ error: `hash_list array length must not exceed ${maxLength}.` });
    }

    // Proceed to the next middleware or route handler
    for (const hash of body['hash_list']) if (isValidHash(hash) === false) return res.status(400).json({ error: `${hash} is not a vaild hash.` });
    next();
  };
}

/////////////////////////////////////
module.exports = { validateArrayBody }


/////////////////////////////////////
function isValidHash(hash) {
  const hashRegex = /^[a-fA-F0-9]{40}|[a-fA-F0-9]{64}|[a-fA-F0-9]{128}$/;
  return hashRegex.test(hash);
}