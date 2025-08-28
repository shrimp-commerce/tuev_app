require "application_system_test_case"

class WorkLogsTest < ApplicationSystemTestCase
  setup do
    @work_log = work_logs(:one)
  end

  test "visiting the index" do
    visit work_logs_url
    assert_selector "h1", text: "Work logs"
  end

  test "should create work log" do
    visit work_logs_url
    click_on "New work log"

    fill_in "Date", with: @work_log.date
    fill_in "Description", with: @work_log.description
    fill_in "End time", with: @work_log.end_time
    fill_in "Start time", with: @work_log.start_time
    click_on "Create Work log"

    assert_text "Work log was successfully created"
    click_on "Back"
  end

  test "should update Work log" do
    visit work_log_url(@work_log)
    click_on "Edit this work log", match: :first

    fill_in "Date", with: @work_log.date
    fill_in "Description", with: @work_log.description
    fill_in "End time", with: @work_log.end_time.to_s
    fill_in "Start time", with: @work_log.start_time.to_s
    click_on "Update Work log"

    assert_text "Work log was successfully updated"
    click_on "Back"
  end

  test "should destroy Work log" do
    visit work_log_url(@work_log)
    click_on "Destroy this work log", match: :first

    assert_text "Work log was successfully destroyed"
  end
end
