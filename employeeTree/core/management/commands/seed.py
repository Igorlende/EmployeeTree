from faker import Faker
from core.models import Employee, EmployeeIcon
import random
import os
from django.core.management.base import BaseCommand


class SeedEmployee:

    def __init__(self):
        self.fake = Faker()

    def seed_employee_icons(self):
        icon_folder = 'static/img/user_icons'
        for filename in os.listdir(icon_folder):
            if filename.endswith('.png') or filename.endswith('.jpg'):
                icon_path = os.path.join(icon_folder, filename)
                EmployeeIcon.objects.create(image=icon_path)

    def seed_employees(self, hierarchy_levels, min_employees):
        def create_employee_hierarchy(parent=None, current_level=0):
            if current_level >= hierarchy_levels:
                return

            num_subordinates = random.randint(1, 3)  # random count subordinates
            for _ in range(num_subordinates):
                employee = Employee.objects.create(
                    full_name=self.fake.name(),
                    position=self.fake.job(),
                    hire_date=self.fake.date_between(start_date='-5y', end_date='today'),
                    email=self.fake.email(),
                    supervisor=parent,
                    icon=EmployeeIcon.objects.order_by('?').first(),

                )
                create_employee_hierarchy(employee, current_level + 1)

        # Create boss
        root_employee = Employee.objects.create(
            full_name=self.fake.name(),
            position='Big Boss', #fake.job(),
            hire_date=self.fake.date_between(start_date='-5y', end_date='today'),
            email=self.fake.email(),
            supervisor=None,
            icon=EmployeeIcon.objects.order_by('?').first(),

        )

        create_employee_hierarchy(root_employee)

        # add employees if them count not enough
        current_employee_count = Employee.objects.count()
        if current_employee_count < min_employees:
            additional_employees_needed = min_employees - current_employee_count
            for _ in range(additional_employees_needed):

                # choose random supervisor from available employees
                random_supervisor = Employee.objects.order_by('?').first()
                random_icon = EmployeeIcon.objects.order_by('?').first()

                employee = Employee.objects.create(
                    full_name=self.fake.name(),
                    position=self.fake.job(),
                    hire_date=self.fake.date_between(start_date='-5y', end_date='today'),
                    email=self.fake.email(),
                    supervisor=random_supervisor,
                    icon=random_icon,
                )

    def seed(self, hierarchy_levels=7, min_employees=100):
        Employee.objects.all().delete()
        EmployeeIcon.objects.all().delete()
        self.seed_employee_icons()
        self.seed_employees(hierarchy_levels=hierarchy_levels, min_employees=min_employees)


class Command(BaseCommand):

    help = "Seed employee by fake random data"
    name = 'seed_employee'

    def add_arguments(self, parser):
        parser.add_argument('--hierarchy-levels', type=int, default=7, help='Number of hierarchy levels')
        parser.add_argument('--min-employees', type=int, default=100, help='Minimum number of employees')

    def handle(self, *args, **options):
        hierarchy_levels = options['hierarchy_levels']
        min_employees = options['min_employees']
        SeedEmployee().seed(hierarchy_levels, min_employees)
        self.stdout.write(self.style.SUCCESS('Successfully ran your command'))