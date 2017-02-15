# State

Notes and docs related to sculptures state

# Shared State

This is all state that is shared and synchronized between sculptures.
The shared state is captured by the `SculptureStore` class.


# Local State

Sculptures have some local state as well.

**Notes:**

* `HandshakeGameLogic`:
   * `_complete`
   * Transition timeout?
* `HandshakeView`:
   * `_complete`
   * `_pulseInterval`
   * `_activityTimeout`
* `MoleGameLogic`:
   * `_complete`
   * `remainingPanels`
   * `_activeTimeouts`
   * Transition timeout?
* `DiskGameLogic`:
   * `_complete`
   * Transition timeout?
* `SimonGameLogic`:
   * `_complete`
   * `_inputTimeout`
   * `_replayTimeout`
   * `_receivedInput`
   * `_targetSequenceIndex`
   * `_targetSequence`
   * Transition timeout?