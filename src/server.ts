import Env from './config/env.config';
import app from './config/express';
import log from 'mb_logger';
import ORM from './config/db.config';
import errHandler from './middlewares/error-handler';
import router from './routes';

const port = Env.PORT ?? 5000;

ORM.authenticate()
	.then(() => {
		log.info('Database connected.');
	})
	.catch((err: any) => {
		log.error('Could not connect to database', err);
	});

app.get('/', (req, res) => {
	res.status(200).json({
		online: true,
		env: Env.ENV,
		host: req.get('host'),
	});
});

app.use('/', router);
app.use(errHandler);

app.listen(port, () => {
	log.info(`Express is listening at ${port}`);
});
