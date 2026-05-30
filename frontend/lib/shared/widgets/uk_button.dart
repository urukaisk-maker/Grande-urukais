import 'package:flutter/material.dart';

enum UkButtonVariant { primary, secondary, outline, ghost }

class UkButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final UkButtonVariant variant;
  final bool isLoading;
  final bool fullWidth;
  final IconData? icon;

  const UkButton({
    super.key,
    required this.text,
    this.onPressed,
    this.variant = UkButtonVariant.primary,
    this.isLoading = false,
    this.fullWidth = true,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final primary = theme.colorScheme.primary;

    Widget child = isLoading
        ? SizedBox(
            height: 20,
            width: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(
                variant == UkButtonVariant.primary ? Colors.white : primary,
              ),
            ),
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[
                Icon(icon, size: 18),
                const SizedBox(width: 8),
              ],
              Text(text),
            ],
          );

    ButtonStyle? style;
    switch (variant) {
      case UkButtonVariant.primary:
        style = ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        );
        break;
      case UkButtonVariant.secondary:
        style = ElevatedButton.styleFrom(
          backgroundColor: theme.colorScheme.secondaryContainer,
          foregroundColor: theme.colorScheme.onSecondaryContainer,
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        );
        break;
      case UkButtonVariant.outline:
        style = OutlinedButton.styleFrom(
          foregroundColor: primary,
          side: BorderSide(color: primary),
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        );
        break;
      case UkButtonVariant.ghost:
        style = TextButton.styleFrom(
          foregroundColor: primary,
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
        );
        break;
    }

    final button = variant == UkButtonVariant.outline
        ? OutlinedButton(onPressed: isLoading ? null : onPressed, style: style, child: child)
        : variant == UkButtonVariant.ghost
            ? TextButton(onPressed: isLoading ? null : onPressed, style: style, child: child)
            : ElevatedButton(onPressed: isLoading ? null : onPressed, style: style, child: child);

    return fullWidth ? SizedBox(width: double.infinity, child: button) : button;
  }
}
