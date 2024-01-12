$(document).ready(function () {
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

    // Натискання на елементи з класом "subordinate"
    $(document).on('click', '.subordinate', function () {
        var employeeId = $(this).data('id');
        loadSubordinates(employeeId, $(this));
    });
});
