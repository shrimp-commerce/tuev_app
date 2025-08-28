require "test_helper"

class WorkLogsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @work_log = work_logs(:one)
  end

  test "should get index" do
    get work_logs_url
    assert_response :success
  end

  test "should get new" do
    get new_work_log_url
    assert_response :success
  end

  test "should create work_log" do
    assert_difference("WorkLog.count") do
      post work_logs_url, params: { work_log: { date: @work_log.date, description: @work_log.description, end_time: @work_log.end_time, start_time: @work_log.start_time } }
    end

    assert_redirected_to work_log_url(WorkLog.last)
  end

  test "should show work_log" do
    get work_log_url(@work_log)
    assert_response :success
  end

  test "should get edit" do
    get edit_work_log_url(@work_log)
    assert_response :success
  end

  test "should update work_log" do
    patch work_log_url(@work_log), params: { work_log: { date: @work_log.date, description: @work_log.description, end_time: @work_log.end_time, start_time: @work_log.start_time } }
    assert_redirected_to work_log_url(@work_log)
  end

  test "should destroy work_log" do
    assert_difference("WorkLog.count", -1) do
      delete work_log_url(@work_log)
    end

    assert_redirected_to work_logs_url
  end
end
