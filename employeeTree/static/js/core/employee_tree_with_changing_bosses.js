// Функція для завантаження наступних віток дерева
function loadSubordinates(employeeId, targetElement) {
    targetElement.append('<div class="spinner-border text-secondary spinner-border-sm" role="status"></div>');
    targetElement.removeClass('subordinate');
    $.ajax({
        url: '/load_two_branch_subordinates/' + employeeId + '/',
        dataType: 'html',
        success: function (data) {
            targetElement.parent().append(data);
            targetElement.find('.spinner-border').remove();
            targetElement.find('a').attr('aria-expanded', 'true');
            // Додавання обробника кліку на всі елементи .subordinate
            targetElement.parent().filter('.subordinate').on('click', function () {
                var newEmployeeId = $(this).data('id');
                loadSubordinates(newEmployeeId, $(this));
            });
        }
    });
}

$(document).ready(function () {
    // Натискання на елементи з класом "subordinate"
    $(document).on('click', '.subordinate', function () {
        var employeeId = $(this).data('id');
        loadSubordinates(employeeId, $(this));
    });
});

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

function drop(ev) {
    ev.preventDefault();
    var employeeId = ev.dataTransfer.getData("employeeId");
    console.log(employeeId);
    var draggedElement = document.querySelector('[data-id="' + employeeId + '"]').parentElement;

    // Відображення підтверджуючого діалогу
    var confirmDrop = window.confirm("Ви впевнені, що хочете перемістити цей елемент?");
    newSupervisorId = findClosestAnchor(ev.target).dataset.id;
    // Додавання елемента в нове місце, якщо користувач підтвердив
    if (confirmDrop) {
        $.ajax({
            url: '/change_supervisor',
            type: 'POST',
            data: {employee_id: employeeId, new_supervisor_id: newSupervisorId, csrfmiddlewaretoken: getCookie('csrftoken')},
            success: function(response) {
                if (response.success) {
                    // Видалення елемента із попереднього місця
                    draggedElement.parentNode.removeChild(draggedElement);
                    //findClosestAnchor(ev.target).parentElement.parentElement.querySelector('ul').appendChild(draggedElement);
                    ul = findClosestAnchor(ev.target).parentElement.parentElement.querySelector('ul');
                    if (ul) {
                        ul.remove();
                    }
                    loadSubordinates(newSupervisorId, $(ev.target).closest('span'));
                    alert('Начальник змінений успішно!');
                } else {
                    alert('Помилка: ' + response.error);

                }
            },
            error: function(xhr, status, error) {
                alert('Помилка AJAX-запиту: ' + error);

            }
        });
    }
}

function dragOver(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    var closestAnchor = findClosestAnchor(ev.target);
    if (closestAnchor) {
        closestAnchor.classList.add("drop-target");
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
            // Отримання значення cookie за його ім'ям
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}