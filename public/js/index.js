/**
 * Created by Administrator on 2017/1/28.
 */



$(function () {
    var $loginBox = $('#loginBox'),
        $registerBox = $('#registerBox'),
        $userInfo = $('.userInfo');

    // 马上注册链接功能
    $loginBox.find('a.colMint').on('click', function() {
        $registerBox.show();
        $loginBox.hide();
    });

    // 马上登录链接功能
    $registerBox.find('a.colMint').on('click', function() {
        $loginBox.show();
        $registerBox.hide();
    });


    //注册按钮功能
    $('.registerBtn').on('click', function (event) {
        $.ajax({
            type: 'post',
            url: '/api/user/register',
            data: {
                username: $registerBox.find('[name="username"]').val(),
                password: $registerBox.find('[name="password"]').val(),
                repassword:  $registerBox.find('[name="repassword"]').val()
            },
            dataType: 'json',
            success: function(result) {
                // 根据服务器返回信息显示不同的注册状态信息
                $registerBox.find('.colWarning').html(result.message);
                    //注册成功
                    if (result.code === 0) {

                        setTimeout(function() {
                            $loginBox.show();
                            $registerBox.hide();
                        }, 1000);
                    }

            }
        });
    });


    //登录按钮功能
    $loginBox.find('button').on('click', function() {
        //通过ajax提交请求
        $.ajax({
            type: 'post',
            url: '/api/user/login',
            data: {
                username: $loginBox.find('[name="username"]').val(),
                password: $loginBox.find('[name="password"]').val()
            },
            dataType: 'json',
            success: function(result) {
                // 根据服务器返回信息提示用户登录状态信息（登陆成功或失败等）
                $loginBox.find('.colWarning').html(result.message);
                // 若登陆成功刷新页面使登陆成功后的页面得以显示给用户
                if (result.code === 0) {
                    setTimeout(function () {
                        window.location.reload();
                    }, 1000);
                }

            }
        });
    });

    //退出登录按钮功能
    $userInfo.find('.logoutBtn').on('click', function (event) {
        $.ajax({
            url: '/api/user/logout',
            success: function (result) {
                if (result.code === 0) {
                    window.location.reload();
                }
            }
        });
    })
});


