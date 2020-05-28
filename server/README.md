## Development environment
Needed:
  - python3
  - virtualenv (`pip3 install virtualenv`)
Create virtualenv to better manage requirements.: `virtualenv <folder_name>`
After that `source <foldername>/bin/activate.sh`

Um die aktuellen reqs zu installieren (im VirtualEnv):
`pip3 install -r requirements.txt`

When new requirements are added (via pip3 install ...):
`pip3 freeze > requirements.txt`

## Testserver start
`python manage.py runserver`
