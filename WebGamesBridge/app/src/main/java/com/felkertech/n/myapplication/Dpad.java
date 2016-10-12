package com.felkertech.n.myapplication;

import android.util.Log;
import android.view.InputDevice;
import android.view.InputEvent;
import android.view.KeyEvent;
import android.view.MotionEvent;

import com.felkertech.n.myapplication.Utils.MovementDirection;

/**
 * Created by N on 3/4/2015.
 */
public class Dpad {
    final static int UP       = MovementDirection.UP;
    final static int LEFT     = MovementDirection.LEFT;
    final static int RIGHT    = MovementDirection.RIGHT;
    final static int DOWN     = MovementDirection.DOWN;
    final static int CENTER   = MovementDirection.CENTER;
    String TAG = "webbridge::Dpad";
    float THRESHOLD = 0.5f;

    int directionPressed = -1; // initialized to -1

    public int getDirectionPressed(InputEvent event) {
        if (!isDpadDevice(event)) {
            return -1;
        }
        directionPressed = -1;
        // If the input event is a MotionEvent, check its hat axis values.
        if (event instanceof MotionEvent) {

            // Use the hat axis value to find the D-pad direction
            MotionEvent motionEvent = (MotionEvent) event;
            float xaxis = getX(motionEvent);
            float yaxis = getY(motionEvent);
            Log.d(TAG, "MotionEvent: "+xaxis+", "+yaxis);

            // Check if the AXIS_HAT_X value is -1 or 1, and set the D-pad
            // LEFT and RIGHT direction accordingly.
            if (Float.compare(xaxis, -THRESHOLD) < 0) {
                directionPressed =  Dpad.LEFT;
            } else if (Float.compare(xaxis, THRESHOLD) > 0) {
                directionPressed =  Dpad.RIGHT;
            }
            // Check if the AXIS_HAT_Y value is -1 or 1, and set the D-pad
            // UP and DOWN direction accordingly.
            else if (Float.compare(yaxis, -THRESHOLD) < 0) {
                directionPressed =  Dpad.UP;
            } else if (Float.compare(yaxis, THRESHOLD) > 0) {
                directionPressed =  Dpad.DOWN;
            }
            Log.d(TAG, directionPressed+" is direction");
        }

        // If the input event is a KeyEvent, check its key code.
        else if (event instanceof KeyEvent) {

            // Use the key code to find the D-pad direction.
            KeyEvent keyEvent = (KeyEvent) event;
            if (keyEvent.getKeyCode() == KeyEvent.KEYCODE_DPAD_LEFT) {
                directionPressed = Dpad.LEFT;
            } else if (keyEvent.getKeyCode() == KeyEvent.KEYCODE_DPAD_RIGHT) {
                directionPressed = Dpad.RIGHT;
            } else if (keyEvent.getKeyCode() == KeyEvent.KEYCODE_DPAD_UP) {
                directionPressed = Dpad.UP;
            } else if (keyEvent.getKeyCode() == KeyEvent.KEYCODE_DPAD_DOWN) {
                directionPressed = Dpad.DOWN;
            } else if (keyEvent.getKeyCode() == KeyEvent.KEYCODE_DPAD_CENTER) {
                directionPressed = Dpad.CENTER;
            }
        }
        return directionPressed;
    }

    public static boolean isDpadDevice(InputEvent event) {
        // Check that input comes from a device with directional pads.
        if ((event.getSource() & InputDevice.SOURCE_DPAD)
                != InputDevice.SOURCE_DPAD) {
            return true;
        } else {
            return false;
        }
    }
    //For thumbsticks, which register as Dpads

    /**
     * There are many ways to get an appropriate value. This finds the one with the most magnitude
     * @return X_hat
     */
    public float getX(MotionEvent motionEvent) {
        float x = motionEvent.getAxisValue(MotionEvent.AXIS_HAT_X);
        if(Math.abs(x) < Math.abs(motionEvent.getX()))
            x = motionEvent.getX();
        if(Math.abs(x) < Math.abs(Dpad.getCenteredAxis(motionEvent, motionEvent.getDevice(), MotionEvent.AXIS_HAT_X, -1)))
            x = Dpad.getCenteredAxis(motionEvent, motionEvent.getDevice(), MotionEvent.AXIS_HAT_X, -1);
        return x;
    }
    /**
     * There are many ways to get an appropriate value. This finds the one with the most magnitude
     * @return Y_hat
     */
    public float getY(MotionEvent motionEvent) {
        float y = motionEvent.getAxisValue(MotionEvent.AXIS_HAT_Y);
        if(Math.abs(y) < Math.abs(motionEvent.getY()))
            y = motionEvent.getY();
        if(Math.abs(y) < Math.abs(Dpad.getCenteredAxis(motionEvent, motionEvent.getDevice(), MotionEvent.AXIS_HAT_Y, -1)))
            y = Dpad.getCenteredAxis(motionEvent, motionEvent.getDevice(), MotionEvent.AXIS_HAT_Y, -1);
        return y;
    }
    public static float getCenteredAxis(MotionEvent event,
                                        InputDevice device, int axis, int historyPos) {
        final InputDevice.MotionRange range =
                device.getMotionRange(axis, event.getSource());

        // A joystick at rest does not always report an absolute position of
        // (0,0). Use the getFlat() method to determine the range of values
        // bounding the joystick axis center.
        if (range != null) {
            final float flat = range.getFlat();
            final float value =
                    historyPos < 0 ? event.getAxisValue(axis):
                            event.getHistoricalAxisValue(axis, historyPos);

            // Ignore axis values that are within the 'flat' region of the
            // joystick axis center.
            if (Math.abs(value) > flat) {
                return value;
            }
        }
        return 0;
    }
}