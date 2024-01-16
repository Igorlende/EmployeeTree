// function for uploading next branches tree
function loadSubordinates(employeeId, targetElement) {
    // add spinner
    targetElement.append('<div class="spinner-border text-secondary spinner-border-sm" role="status"></div>');
    targetElement.removeClass('subordinate');
    $.ajax({
        url: '/load_two_branch_subordinates_with_changing_bosses/' + employeeId + '/',
        dataType: 'html',
        success: function (data) {
            targetElement.parent().append(data);
            targetElement.find('.spinner-border').remove();
            targetElement.find('a').attr('aria-expanded', 'true');
            // add handlers to new elements .subordinate
            targetElement.parent().filter('.subordinate').on('click', function () {
                var newEmployeeId = $(this).data('id');
                loadSubordinates(newEmployeeId, $(this));
            });
        }
    });
}

$(document).ready(function () {
    // add handlers to all elements .subordinate
    $(document).on('click', '.subordinate', function () {
        var employeeId = $(this).data('id');
        loadSubordinates(employeeId, $(this));
    });
});

function drop(ev) {
    ev.preventDefault();

    var employeeId = ev.dataTransfer.getData("employeeId");
    var newSupervisorId = findClosestAnchor(ev.target).dataset.id;

    // remove border effect
    var closestAnchor = findClosestAnchor(ev.target);
    if (closestAnchor) {
        closestAnchor.parentElement.classList.remove("drop-target");
    }

    if (employeeId == newSupervisorId) {return;}

    var employee = document.querySelector('[data-id="' + employeeId + '"]');
    var employeeFullName = employee.querySelector('.full-name');
    var employeePosition = employee.querySelector('.position');

    var newSupervisor = document.querySelector('[data-id="' + newSupervisorId + '"]');
    var newSupervisorFullName = newSupervisor.querySelector('.full-name');
    var newSupervisorPosition = newSupervisor.querySelector('.position');

    var draggedElement = employee.parentElement;

    var confirmDrop = window.confirm("Are you sure change boss for " + employeeFullName.textContent + "(" + employeePosition.textContent + ") to " + newSupervisorFullName.textContent + "(" + newSupervisorPosition.textContent + ")?");

    if (confirmDrop) {
        var spinnerEmployee = $('<div class="spinner-border text-secondary spinner-border-sm" role="status"></div>').appendTo(employee.querySelector('a'));
        var spinnerSupervisor = $('<div class="spinner-border text-secondary spinner-border-sm" role="status"></div>').appendTo(newSupervisor.querySelector('a'));

        $.ajax({
            url: '/change_supervisor',
            type: 'POST',
            data: {employee_id: employeeId, new_supervisor_id: newSupervisorId, csrfmiddlewaretoken: getCookie('csrftoken')},
            beforeSend: function() {
            // show spinner
            spinnerEmployee.show();
            spinnerSupervisor.show();

            },
            success: function(response) {
                if (response.success) {
                    // reload page if that top branch
                    if (newSupervisor.classList.contains('top')) {
                        alert('Boss successfully changed!');
                        location.reload();
                        return;
                    }
                    // reload branch
                    draggedElement.parentNode.removeChild(draggedElement);
                    ul = findClosestAnchor(ev.target).parentElement.parentElement.querySelector('ul');
                    if (ul) {
                        ul.remove();
                    }
                    loadSubordinates(newSupervisorId, $(ev.target).closest('span'));
                    alert('Boss successfully changed!');
                } else {
                    alert('Error: ' + response.error);

                }
            },
            error: function(xhr, status, error) {
                alert('Error AJAX request: ' + error);

            },
            complete: function() {
            // hide spinner
            spinnerEmployee.hide();
            spinnerSupervisor.hide();
        }
        });
    }
}

function dragLeave(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    var closestAnchor = findClosestAnchor(ev.target);
    if (closestAnchor) {
        closestAnchor.parentElement.classList.remove("drop-target");
    }
}

function allowDrop(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    var closestAnchor = findClosestAnchor(ev.target);
    if (closestAnchor) {
        closestAnchor.parentElement.classList.add("drop-target");
    }
}

function drag(ev) {
  ev.dataTransfer.setData("employeeId", ev.target.dataset.id);
}

function findClosestAnchor(element) {
    while (element) {
        if (element.tagName === 'A') {
            return element;
        }
        element = element.parentElement;
    }
    return null;
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

