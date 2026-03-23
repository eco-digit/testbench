from threading import Timer


class RepeatTimer(Timer):
    """A timer, that repeats the super.function every super.interval seconds until the RepeatTimer is cancelled."""

    def run(self):
        """Repeats the :py:attr:`RepeatTimer.function` every :py:attr:`RepeatTimer.interval` seconds.

        The first execution is after interval seconds.
        """
        while not self.finished.wait(self.interval):
            self.function(*self.args, **self.kwargs)
