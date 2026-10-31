package vn.caphenpro.sohuithongminh;

import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

@CapacitorPlugin(name = "ReceiptExport")
public class ReceiptExportPlugin extends Plugin {

    @PluginMethod
    public void saveToDownloads(PluginCall call) {
        String base64 = call.getString("base64");
        String fileName = call.getString("fileName");
        if (base64 == null || base64.isEmpty() || fileName == null || fileName.isEmpty()) {
            call.reject("Thiếu dữ liệu ảnh hoặc tên tệp.");
            return;
        }

        Uri itemUri = null;
        try {
            byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ContentValues values = new ContentValues();
                values.put(MediaStore.Downloads.DISPLAY_NAME, fileName);
                values.put(MediaStore.Downloads.MIME_TYPE, "image/png");
                values.put(MediaStore.Downloads.RELATIVE_PATH,
                        Environment.DIRECTORY_DOWNLOADS + "/SoHuiThongMinh");
                values.put(MediaStore.Downloads.IS_PENDING, 1);

                itemUri = getContext().getContentResolver().insert(
                        MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                if (itemUri == null) throw new Exception("Android không tạo được tệp trong Download.");

                try (OutputStream output = getContext().getContentResolver().openOutputStream(itemUri)) {
                    if (output == null) throw new Exception("Không mở được tệp để ghi ảnh.");
                    output.write(bytes);
                    output.flush();
                }

                ContentValues completed = new ContentValues();
                completed.put(MediaStore.Downloads.IS_PENDING, 0);
                getContext().getContentResolver().update(itemUri, completed, null, null);
            } else {
                File directory = getContext().getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                if (directory == null) throw new Exception("Không truy cập được thư mục tải xuống của ứng dụng.");
                if (!directory.exists() && !directory.mkdirs()) throw new Exception("Không tạo được thư mục tải xuống.");
                File outputFile = new File(directory, fileName);
                try (FileOutputStream output = new FileOutputStream(outputFile)) {
                    output.write(bytes);
                    output.flush();
                }
                itemUri = Uri.fromFile(outputFile);
            }

            JSObject result = new JSObject();
            result.put("uri", itemUri.toString());
            call.resolve(result);
        } catch (Exception error) {
            if (itemUri != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                try { getContext().getContentResolver().delete(itemUri, null, null); } catch (Exception ignored) {}
            }
            call.reject("Lưu ảnh vào Download thất bại: " + error.getMessage(), error);
        }
    }

    @PluginMethod
    public void shareImage(PluginCall call) {
        String base64 = call.getString("base64");
        String fileName = call.getString("fileName");
        String title = call.getString("title", "Chia sẻ bảng thu hụi");
        String text = call.getString("text", "Bảng thu hụi");
        if (base64 == null || base64.isEmpty() || fileName == null || fileName.isEmpty()) {
            call.reject("Thiếu dữ liệu ảnh hoặc tên tệp.");
            return;
        }

        try {
            byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
            File directory = new File(getContext().getCacheDir(), "receipt-images");
            if (!directory.exists() && !directory.mkdirs()) {
                throw new Exception("Không tạo được tệp ảnh tạm để chia sẻ.");
            }
            File imageFile = new File(directory, fileName);
            try (FileOutputStream output = new FileOutputStream(imageFile)) {
                output.write(bytes);
                output.flush();
            }

            Uri contentUri = FileProvider.getUriForFile(
                    getContext(),
                    getContext().getPackageName() + ".fileprovider",
                    imageFile
            );

            Intent sendIntent = new Intent(Intent.ACTION_SEND);
            sendIntent.setType("image/png");
            sendIntent.putExtra(Intent.EXTRA_STREAM, contentUri);
            sendIntent.putExtra(Intent.EXTRA_SUBJECT, title);
            sendIntent.putExtra(Intent.EXTRA_TEXT, text);
            sendIntent.setClipData(android.content.ClipData.newUri(
                    getContext().getContentResolver(), "Bảng thu hụi", contentUri));
            sendIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

            Intent chooser = Intent.createChooser(sendIntent, title);
            chooser.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getActivity().startActivity(chooser);
            call.resolve();
        } catch (Exception error) {
            call.reject("Không mở được bảng chia sẻ ảnh: " + error.getMessage(), error);
        }
    }
}
