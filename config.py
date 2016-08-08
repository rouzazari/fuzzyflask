import os
basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SQLALCHEMY_COMMIT_ON_TEARDOWN = True
    CELERY_MAIN = 'tasks'
    BROKER_DETAILS = dict(user=os.environ.get('CELERY_BROKER_USERNAME'),
                          password=os.environ.get('CELERY_BROKER_PASSWORD'),
                          server=os.environ.get('CELERY_BROKER_SERVER'),
                          port=os.environ.get('CELERY_BROKER_PORT'),
                          vhost=os.environ.get('CELERY_BROKER_VHOST'))
    CELERY_BROKER_URL = 'amqp://{user}:{password}@{server}:{port}/{vhost}'.format(**BROKER_DETAILS)
    CELERY_RESULT_BACKEND = 'rpc://'
    CELERY_TASK_SERIALIZER = 'json'
    CELERY_RESULT_SERIALIZER = 'json'
    CELERY_ACCEPT_CONTENT = ['json']
    CELERY_TIMEZONE = 'US/Pacific'

    @staticmethod
    def init_app(app):
        pass


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or (
        'sqlite:///' + os.path.join(basedir, 'data-dev.sqlite'))


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('TEST_DATABASE_URL') or (
        'sqlite:///' + os.path.join(basedir, 'data-test.sqlite'))


class ProductionConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or (
        'sqlite:///' + os.path.join(basedir, 'data.sqlite'))

config = {
        'development': DevelopmentConfig,
        'testing': TestingConfig,
        'production': ProductionConfig,

        'default': DevelopmentConfig
        }
