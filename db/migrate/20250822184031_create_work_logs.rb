class CreateWorkLogs < ActiveRecord::Migration[8.0]
  def change
    create_table :work_logs do |t|
      t.date :date
      t.time :start_time
      t.time :end_time
      t.string :description

      t.timestamps
    end
  end
end
