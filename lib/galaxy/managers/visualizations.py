"""
Manager and Serializers for Visualizations.

Visualizations are saved configurations/variables used to
reproduce a specific view in a Galaxy visualization.
"""
import logging
from typing import Optional

from galaxy import model
from galaxy.managers import sharable
from galaxy.schema.fields import EncodedDatabaseIdField
from galaxy.structured_app import MininmalManagerApp

log = logging.getLogger(__name__)


class VisualizationManager(sharable.SharableModelManager):
    """
    Handle operations outside and between visualizations and other models.
    """

    # TODO: revisions

    model_class = model.Visualization
    foreign_key_name = 'visualization'
    user_share_model = model.VisualizationUserShareAssociation

    tag_assoc = model.VisualizationTagAssociation
    annotation_assoc = model.VisualizationAnnotationAssociation
    rating_assoc = model.VisualizationRatingAssociation

    # def copy( self, trans, visualization, user, **kwargs ):
    #    """
    #    """
    #    pass


class VisualizationSerializer(sharable.SharableModelSerializer):
    """
    Interface/service object for serializing visualizations into dictionaries.
    """
    model_manager_class = VisualizationManager
    SINGLE_CHAR_ABBR = 'v'

    def __init__(self, app: MininmalManagerApp):
        super().__init__(app)
        self.visualization_manager = self.manager

        self.default_view = 'summary'
        self.add_view('summary', [])
        self.add_view('detailed', [])

    def add_serializers(self):
        super().add_serializers()
        self.serializers.update({
        })


class VisualizationDeserializer(sharable.SharableModelDeserializer):
    """
    Interface/service object for validating and deserializing
    dictionaries into visualizations.
    """
    model_manager_class = VisualizationManager

    def __init__(self, app):
        super().__init__(app)
        self.visualization_manager = self.manager

    def add_deserializers(self):
        super().add_deserializers()
        self.deserializers.update({
        })
        self.deserializable_keyset.update(self.deserializers.keys())


class VisualizationsService:
    """Common interface/service logic for interactions with visualizations in the context of the API.

    Provides the logic of the actions invoked by API controllers and uses type definitions
    and pydantic models to declare its parameters and return types.
    """

    def __init__(self, app: MininmalManagerApp, manager: VisualizationManager, serializer: VisualizationSerializer):
        self.app = app
        self.manager = manager
        self.serializer = serializer
        self.shareable_service = sharable.ShareableService(self.manager, self.serializer)

    # TODO: add the rest of the API actions here and call them directly from the API controller

    def sharing(self, trans, id: EncodedDatabaseIdField, payload: Optional[sharable.SharingPayload] = None) -> sharable.SharingStatus:
        """Allows to publish or share with other users the given resource (by id) and returns the current sharing
        status of the resource.
        """
        return self.shareable_service.sharing(trans, id, payload)
