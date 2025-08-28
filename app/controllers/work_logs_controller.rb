class WorkLogsController < ApplicationController
  # GET /admin/work_logs
  def admin_index
    unless Current.user&.admin?
      redirect_to root_path, alert: "Access denied."
      return
    end
    @work_logs = WorkLog.all
  end
  before_action :set_work_log, only: %i[ show edit update destroy ]

  # GET /work_logs or /work_logs.json
  def index
    @work_logs = Current.user.work_logs
  end

  # GET /work_logs/1 or /work_logs/1.json
  def show
  end

  # GET /work_logs/new
  def new
    @work_log = WorkLog.new
  end

  # GET /work_logs/1/edit
  def edit
  end

  # POST /work_logs or /work_logs.json
  def create
    @work_log = Current.user.work_logs.build(work_log_params.except(:description))

    respond_to do |format|
      if @work_log.save
        # Assign rich text description after save to avoid unique constraint error
        if work_log_params[:description].present?
          @work_log.description = work_log_params[:description]
          @work_log.save
        end
        format.html { redirect_to @work_log, notice: "Work log was successfully created." }
        format.json { render :show, status: :created, location: @work_log }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @work_log.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /work_logs/1 or /work_logs/1.json
  def update
    respond_to do |format|
      if @work_log.update(work_log_params)
        format.html { redirect_to @work_log, notice: "Work log was successfully updated.", status: :see_other }
        format.json { render :show, status: :ok, location: @work_log }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @work_log.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /work_logs/1 or /work_logs/1.json
  def destroy
    @work_log.destroy!

    respond_to do |format|
      format.html { redirect_to work_logs_path, notice: "Work log was successfully destroyed.", status: :see_other }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_work_log
      @work_log = WorkLog.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def work_log_params
      params.expect(work_log: [ :date, :start_time, :end_time, :description ])
    end
end
