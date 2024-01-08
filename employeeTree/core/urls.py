from django.urls import path
from .views import EmployeeTreeView, LoadTwoBranchSubordinatesView

urlpatterns = [
    path('', EmployeeTreeView.as_view(), name='employee_tree'),
    path('load_two_branch_subordinates/<int:employee_id>/', LoadTwoBranchSubordinatesView.as_view(),
         name='load_two_branch_subordinates'),
]
