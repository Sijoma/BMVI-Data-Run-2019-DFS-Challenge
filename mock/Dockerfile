FROM python:3.7-alpine

WORKDIR /usr/local/bin

COPY . .

RUN pip install -r requirements.txt

CMD [ "python", "./mock.py" ]
