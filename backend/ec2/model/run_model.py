from model.face_cloak_model import FaceCloakModel


def run_model(compress_size = 512, p_allow = 0.0, alpha = 5, input_path = None, output_path = None):
    model = FaceCloakModel(p_allow=p_allow, alpha=alpha, compress_size=compress_size)

    print("\nProcessing image: ", input_path, " (", compress_size, ")" )

    # Cloak the face
    x_cloaked, x_copy, x_box, y_copy, y_path = model.cloak_face(input_path)
    if x_cloaked is None:
        return False

    # Save the cloaked image
    model.save_image(x_cloaked, input_path, x_box, output_path)

    return True

