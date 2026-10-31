package vn.caphenpro.sohuithongminh;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ReceiptExportPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
