const router = require('express').Router();
// apiRoutes.js already wires up the dashboard view plus all /api CRUD endpoints;
// this used to point at the now-removed homeRoutes.js, which only duplicated
// the dashboard route and left every /api endpoint unmounted.
const apiRoutes = require('../routes/apiRoutes');

router.use('/', apiRoutes);

module.exports = router;
