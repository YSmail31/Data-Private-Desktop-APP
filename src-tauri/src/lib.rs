mod local_model;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      local_model::local_model_status,
      local_model::download_local_model,
      local_model::run_local_model,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
