package com.felkertech.n.myapplication;

import android.view.InputDevice;
import android.view.MotionEvent;

import com.felkertech.n.myapplication.Utils.MovementDirection;

/**
 * Created by N on 3/4/2015.
 */
public class GamePad {
    /**
     * What is the least amount of force required to register this as a movement in a single direction?
     */
    public static final double TAP_THRESHOLD = 0.1;
    private float input_x = 0;
    private float input_y = 0;
    public static boolean isJoystickInput(MotionEvent m) {
        return (m.getSource() & InputDevice.SOURCE_JOYSTICK) ==
                InputDevice.SOURCE_JOYSTICK &&
                m.getAction() == MotionEvent.ACTION_MOVE;
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
    public void processJoystickInput(MotionEvent event, int historyPos) {
        InputDevice mInputDevice = event.getDevice();

        // Calculate the horizontal distance to move by
        // using the input value from one of these physical controls:
        // the left control stick, hat axis, or the right control stick.
        input_x = GamePad.getCenteredAxis(event, mInputDevice,
                MotionEvent.AXIS_X, historyPos);
        if (input_x == 0) {
            input_x = GamePad.getCenteredAxis(event, mInputDevice,
                    MotionEvent.AXIS_HAT_X, historyPos);
        }
        if (input_x == 0) {
            input_x = GamePad.getCenteredAxis(event, mInputDevice,
                    MotionEvent.AXIS_Z, historyPos);
        }

        // Calculate the vertical distance to move by
        // using the input value from one of these physical controls:
        // the left control stick, hat switch, or the right control stick.
        input_y = GamePad.getCenteredAxis(event, mInputDevice,
                MotionEvent.AXIS_Y, historyPos);
        if (input_y == 0) {
            input_y = GamePad.getCenteredAxis(event, mInputDevice,
                    MotionEvent.AXIS_HAT_Y, historyPos);
        }
        if (input_y == 0) {
            input_y = GamePad.getCenteredAxis(event, mInputDevice,
                    MotionEvent.AXIS_RZ, historyPos);
        }
    }

    public float getX() {
        return input_x;
    }

    public float getY() {
        return input_y;
    }

    /**
     * Assumes a single movement from x and y floats
     * @return Returns a single direction in LRUD
     */
    public int getApproximateDirection() {
        // Update the ship object based on the new x and y values
        // Send LRUD events if movement is beyond a threshold
        if(Math.abs(getX()) > Math.abs(getY())) {
            //Do X first
            if(getX() > TAP_THRESHOLD)
                return MovementDirection.RIGHT;
            else if(-getX() < -TAP_THRESHOLD)
                return MovementDirection.LEFT;
            else if(getY() > TAP_THRESHOLD)
                return MovementDirection.DOWN;
            else if(-getY() < -TAP_THRESHOLD)
                return MovementDirection.UP;
        } else {
            //Do Y first
            if(getY() > TAP_THRESHOLD)
                return MovementDirection.DOWN;
            else if(-getY() < -TAP_THRESHOLD)
                return MovementDirection.UP;
            else if(getX() > TAP_THRESHOLD)
                return MovementDirection.RIGHT;
            else if(-getX() < -TAP_THRESHOLD)
                return MovementDirection.LEFT;
        }
        return MovementDirection.CENTER;
    }
}
