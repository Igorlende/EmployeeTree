from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from django.views import View
from .models import Employee
import time


class EmployeeTreeView(View):
    template_name = 'core/employee_tree.html'

    def get_context_data(self, employee, depth=2):
        data = {
            'id': employee.id,
            'full_name': employee.full_name,
            'position': employee.position,
            'icon': employee.icon,
            'subordinates': [],
        }

        if depth > 0:
            data['subordinates'] = [self.get_context_data(subordinate, depth-1) for subordinate in employee.subordinates.all()]

        return data

    def get(self, request, *args, **kwargs):
        try:
            root_employee = Employee.objects.get(supervisor=None)
        except Employee.DoesNotExist:
            return JsonResponse({'error': 'Database if not full'}, status=400)

        tree_structure = self.get_context_data(root_employee)
        return render(request, self.template_name, {'tree_structure': tree_structure})


class EmployeeTreeWithChangingBossesView(EmployeeTreeView):
    template_name = 'core/employee_tree_with_changing_bosses.html'


class LoadTwoBranchSubordinatesView(View):
    template_name = 'core/load_two_branch_subordinates.html'

    def get_subordinates(self, employee, depth=2):
        if depth > 0:
            subordinates = [{'id': subordinate.id, 'full_name': subordinate.full_name, 'position': subordinate.position,
                             'icon': subordinate.icon, 'subordinates': self.get_subordinates(subordinate, depth - 1)}
                            for subordinate in employee.subordinates.all()]
        else:
            subordinates = [{'id': subordinate.id, 'full_name': subordinate.full_name, 'position': subordinate.position,
                             'icon': subordinate.icon, 'subordinates': []} for subordinate in employee.subordinates.all()]
        return subordinates

    def get(self, request, *args, **kwargs):
        #time.sleep(1)
        employee_id = kwargs.get('employee_id')

        try:
            employee = Employee.objects.get(id=employee_id)
        except Employee.DoesNotExist:
            return JsonResponse({'error': 'Employee not found'}, status=404)

        subordinates = self.get_subordinates(employee)

        if len(subordinates) == 0:
            return HttpResponse('')

        return render(request, self.template_name, {'subordinates': subordinates, 'employee_id': employee_id})


class LoadTwoBranchSubordinatesWithChangingBossesView(LoadTwoBranchSubordinatesView):
    template_name = 'core/load_two_branch_subordinates_with_changing_bosses.html'


class ChangeSupervisorView(View):

    def post(self, request, *args, **kwargs):
        #time.sleep(1)
        employee_id = request.POST.get('employee_id')
        new_supervisor_id = request.POST.get('new_supervisor_id')

        try:
            employee = Employee.objects.get(id=employee_id)
            new_supervisor = Employee.objects.get(id=new_supervisor_id)
        except Employee.DoesNotExist:
            return JsonResponse({'error': 'Employee not found'}, status=404)

        employee.change_supervisor(new_supervisor)
        return JsonResponse({'success': 'Supervisor changed successfully'})

