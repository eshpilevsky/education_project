from django.core.management.base import BaseCommand, CommandError

from account.models import SchoolData, SchoolType, State, Subject

SUBJECTS = ["Английский язык", "Немецкий язык", "Математика", "Информатика", "Физика", "Химия", "История",
            "Биология", "Музыка", "География", "Русский язык", "Обществоведение", "Искусство"]
MAX_GRADES = {"Гимназия": 10, "Школа": 10,
              "Институт": 10, "Колледж": 10}
STATES = {"Минск": "MI",
          "Гомель": "GO",
          "Гродно": "GR",
          "Витебск": "BB",}


class Command(BaseCommand):
    help = 'populates DB with default values'

    def handle(self, *args, **options):
        # create states
        for state, short in STATES.items():
            sobj = State(name=state, shortcode=short)
            sobj.save()

        # Create School-types and schooldata for each grade
        for stype, max_grade in MAX_GRADES.items():
            typeobj = SchoolType(name=stype)
            typeobj.save()
            for i in range(5, max_grade+1):
                dataobj = SchoolData(school_type=typeobj, grade=i)
                dataobj.save()

        # create subjects
        for subj in SUBJECTS:
            subjobj = Subject(name=subj)
            subjobj.save()
