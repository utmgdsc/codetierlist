FROM python:3.12.1

# for user code
WORKDIR /code

# for user tests
WORKDIR /tests

# for runner data
WORKDIR /setup
COPY runner.py ./

CMD ["python", "runner.py"]
